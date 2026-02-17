<?php

declare(strict_types=1);

namespace App\Console\Commands\Newsroom;

use App\Models\CollectionMethod;
use App\Models\NewsSource;
use App\Services\Newsroom\EventPlatformDetectorService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Throwable;

final class ScanSourceForEventsCommand extends Command
{
    protected $signature = 'newsroom:scan-events
                            {--source= : NewsSource ID to scan}
                            {--url= : Single URL to scan (for testing)}
                            {--all : Scan all active sources with website_url}';

    protected $description = 'Scan news sources for embedded event calendar systems and create collection methods';

    public function handle(EventPlatformDetectorService $detector): int
    {
        $sources = $this->resolveSources();

        if ($sources->isEmpty()) {
            $this->error('No sources to scan. Use --source=<id>, --url=<url>, or --all');

            return self::FAILURE;
        }

        $this->info('Scanning '.$sources->count().' source(s) for event platforms...');

        $report = [
            'scanned' => 0,
            'platforms_found' => 0,
            'methods_created' => 0,
            'methods_updated' => 0,
        ];

        foreach ($sources as $source) {
            $url = $source instanceof NewsSource ? $source->website_url : $source;
            if (empty($url)) {
                $this->warn('Skipping: no website_url');

                continue;
            }

            $report['scanned']++;

            try {
                $response = Http::timeout(20)
                    ->withHeaders(['User-Agent' => 'Mozilla/5.0 (compatible; DayNewsBot/1.0)'])
                    ->get($url);

                if (! $response->successful()) {
                    $this->warn("HTTP {$response->status()} for {$url}");

                    continue;
                }

                $html = $response->body();
                $result = $detector->detectFromHtml($url, $html);

                if (! empty($result['platforms'])) {
                    $report['platforms_found']++;
                    $this->line("  [{$url}] Platforms: ".implode(', ', $result['platforms']));

                    if ($source instanceof NewsSource) {
                        $this->updateSourceAndMethods($source, $result, $report);
                    }
                }

                if (! empty($result['ical_urls'])) {
                    $this->line("  [{$url}] iCal URLs: ".implode(', ', $result['ical_urls']));
                    if ($source instanceof NewsSource) {
                        $this->createIcalMethods($source, $result['ical_urls'], $report);
                    }
                }
            } catch (Throwable $e) {
                $this->warn("  Error scanning {$url}: ".$e->getMessage());
            }
        }

        $this->newLine();
        $this->info('Scan complete: '.$report['scanned'].' scanned, '.$report['platforms_found'].' with event platforms, '.$report['methods_created'].' created, '.$report['methods_updated'].' updated.');

        return self::SUCCESS;
    }

    /**
     * @return \Illuminate\Support\Collection<int, NewsSource|string>
     */
    private function resolveSources(): \Illuminate\Support\Collection
    {
        $sourceId = $this->option('source');
        $url = $this->option('url');
        $all = $this->option('all');

        if ($url) {
            return collect([$url]);
        }

        if ($sourceId) {
            $source = NewsSource::find($sourceId);
            if (! $source) {
                $this->error("NewsSource {$sourceId} not found");

                return collect();
            }

            return collect([$source]);
        }

        if ($all) {
            return NewsSource::active()
                ->whereNotNull('website_url')
                ->where('website_url', '!=', '')
                ->get();
        }

        return collect();
    }

    /**
     * @param  array{platforms: array<string>, event_urls: array<string>, ical_urls: array<string>}  $result
     */
    private function updateSourceAndMethods(NewsSource $source, array $result, array &$report): void
    {
        $contentTypes = $source->content_types ?? ['news'];
        if (! in_array('events', $contentTypes, true)) {
            $contentTypes[] = 'events';
            $source->update(['content_types' => $contentTypes]);
        }

        $platformConfig = array_merge($source->platform_config ?? [], [
            'event_platform_slugs' => $result['platforms'],
            'event_paths' => $result['event_urls'],
        ]);
        $source->update(['platform_config' => $platformConfig]);

        $existing = $source->collectionMethods()
            ->where('method_type', CollectionMethod::TYPE_EVENT_CALENDAR)
            ->first();

        if ($existing) {
            $existing->update([
                'platform_config' => array_merge($existing->platform_config ?? [], [
                    'event_platform_slugs' => $result['platforms'],
                    'event_paths' => $result['event_urls'],
                ]),
            ]);
            $report['methods_updated']++;
        } else {
            $firstEventUrl = $result['event_urls'][0] ?? $source->website_url;
            $source->collectionMethods()->create([
                'method_type' => CollectionMethod::TYPE_EVENT_CALENDAR,
                'name' => $source->name.' - Events',
                'endpoint_url' => $firstEventUrl,
                'poll_interval_minutes' => 1440,
                'is_enabled' => true,
                'platform_config' => [
                    'event_platform_slugs' => $result['platforms'],
                    'event_paths' => $result['event_urls'],
                ],
            ]);
            $report['methods_created']++;
        }
    }

    /**
     * @param  array<string>  $icalUrls
     */
    private function createIcalMethods(NewsSource $source, array $icalUrls, array &$report): void
    {
        foreach ($icalUrls as $icalUrl) {
            $existing = $source->collectionMethods()
                ->where('method_type', CollectionMethod::TYPE_ICAL)
                ->where('endpoint_url', $icalUrl)
                ->first();

            if (! $existing) {
                $source->collectionMethods()->create([
                    'method_type' => CollectionMethod::TYPE_ICAL,
                    'name' => $source->name.' - iCal',
                    'endpoint_url' => $icalUrl,
                    'poll_interval_minutes' => 1440,
                    'is_enabled' => true,
                    'platform_config' => ['ical_url' => $icalUrl],
                ]);
                $report['methods_created']++;
            }
        }
    }
}
