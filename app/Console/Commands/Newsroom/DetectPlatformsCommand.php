<?php

declare(strict_types=1);

namespace App\Console\Commands\Newsroom;

use App\Models\NewsSource;
use App\Services\Newsroom\AdaptiveFetcherService;
use App\Services\Newsroom\PlatformDetectorService;
use Exception;
use Illuminate\Console\Command;

/**
 * Detect platforms for existing news sources and optionally auto-configure collection methods.
 *
 * Usage:
 *   php artisan newsroom:detect-platforms                    # Detect all undetected sources
 *   php artisan newsroom:detect-platforms --force            # Re-detect all sources
 *   php artisan newsroom:detect-platforms --auto-configure   # Also create collection methods
 *   php artisan newsroom:detect-platforms --url=https://...  # Test a single URL
 */
final class DetectPlatformsCommand extends Command
{
    protected $signature = 'newsroom:detect-platforms
        {--force : Re-detect even if already detected}
        {--auto-configure : Auto-create optimized collection methods}
        {--url= : Test detection on a single URL}
        {--community= : Filter by community ID}
        {--limit=100 : Max sources to process}';

    protected $description = 'Detect website platforms for news sources and optionally auto-configure collection';

    public function __construct(
        private readonly PlatformDetectorService $detector,
        private readonly AdaptiveFetcherService $fetcher,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        // Single URL test mode
        if ($url = $this->option('url')) {
            return $this->testSingleUrl($url);
        }

        // Batch detection
        $query = NewsSource::query()
            ->active()
            ->whereNotNull('website_url')
            ->where('website_url', '!=', '');

        if (! $this->option('force')) {
            $query->whereNull('platform_detected_at');
        }

        if ($communityId = $this->option('community')) {
            $query->where('community_id', $communityId);
        }

        $sources = $query->limit((int) $this->option('limit'))->get();

        $this->info("Processing {$sources->count()} sources...");
        $this->newLine();

        $bar = $this->output->createProgressBar($sources->count());
        $bar->start();

        $stats = ['detected' => 0, 'unknown' => 0, 'failed' => 0, 'configured' => 0];
        $platformCounts = [];

        foreach ($sources as $source) {
            try {
                $profile = $this->detector->detect($source->website_url);

                if ($profile) {
                    $source->update([
                        'platform_profile_id' => $profile->id,
                        'detected_platform_slug' => $profile->slug,
                        'platform_detected_at' => now(),
                    ]);
                    $stats['detected']++;
                    $platformCounts[$profile->slug] = ($platformCounts[$profile->slug] ?? 0) + 1;

                    // Auto-configure collection method if requested
                    if ($this->option('auto-configure')) {
                        $method = $this->fetcher->autoConfigureMethod($source);
                        if ($method) {
                            $stats['configured']++;
                        }
                    }
                } else {
                    $stats['unknown']++;
                }

            } catch (Exception $e) {
                $stats['failed']++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        // Summary
        $this->info('Detection Results:');
        $this->table(
            ['Metric', 'Count'],
            [
                ['Detected', $stats['detected']],
                ['Unknown Platform', $stats['unknown']],
                ['Failed', $stats['failed']],
                ['Auto-Configured', $stats['configured']],
            ]
        );

        if (! empty($platformCounts)) {
            $this->newLine();
            $this->info('Platform Distribution:');
            arsort($platformCounts);
            $rows = array_map(fn ($slug, $count) => [$slug, $count], array_keys($platformCounts), $platformCounts);
            $this->table(['Platform', 'Count'], $rows);
        }

        return self::SUCCESS;
    }

    private function testSingleUrl(string $url): int
    {
        $this->info("Testing: {$url}");
        $this->newLine();

        $slug = $this->detector->detectSlug($url);

        if ($slug) {
            $this->info("✅ Detected: {$slug}");

            $profile = \App\Models\PlatformProfile::findBySlug($slug);
            if ($profile) {
                $this->table(
                    ['Property', 'Value'],
                    [
                        ['Platform', $profile->display_name],
                        ['Category', $profile->category],
                        ['Best Fetch Method', $profile->best_fetch_method],
                        ['Needs JS', $profile->needs_js_rendering ? 'Yes' : 'No'],
                        ['RSS Patterns', implode(', ', $profile->rss_patterns ?? [])],
                        ['Content Selectors', implode(', ', $profile->content_selectors ?? [])],
                        ['Confidence', $profile->confidence_score],
                    ]
                );
            }
        } else {
            $this->warn('❌ Unknown platform — would use AI extract fallback');
        }

        return self::SUCCESS;
    }
}
