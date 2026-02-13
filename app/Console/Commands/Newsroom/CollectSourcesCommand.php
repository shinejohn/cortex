<?php

declare(strict_types=1);

namespace App\Console\Commands\Newsroom;

use App\Models\CollectionMethod;
use App\Models\Region;
use App\Services\Newsroom\AdaptiveFetcherService;
use Exception;
use Illuminate\Console\Command;

/**
 * Manually collect from direct sources (RSS, scraping) using the adaptive fetcher.
 *
 * Usage:
 *   php artisan newsroom:collect-sources                    # All regions
 *   php artisan newsroom:collect-sources --region=UUID      # Specific region
 *   php artisan newsroom:collect-sources --source=UUID      # Specific source
 *   php artisan newsroom:collect-sources --dry-run          # Preview what would run
 */
final class CollectSourcesCommand extends Command
{
    protected $signature = 'newsroom:collect-sources
        {--region= : Collect for a specific region ID}
        {--source= : Collect from a specific source ID}
        {--dry-run : Show what would be collected without actually collecting}
        {--limit=50 : Max sources to process}';

    protected $description = 'Collect news from direct sources (RSS, web scraping) via adaptive fetcher';

    public function handle(AdaptiveFetcherService $fetcher): int
    {
        // Single source mode
        if ($sourceId = $this->option('source')) {
            return $this->collectSingleSource($fetcher, $sourceId);
        }

        // Build query for collection methods due
        $query = CollectionMethod::dueForCollection()->with('source');

        if ($regionId = $this->option('region')) {
            $query->whereHas('source', fn ($q) => $q->where('region_id', $regionId));
        }

        $methods = $query->limit((int) $this->option('limit'))->get();

        if ($methods->isEmpty()) {
            $this->info('No sources due for collection.');

            return self::SUCCESS;
        }

        $this->info("Found {$methods->count()} sources due for collection.");
        $this->newLine();

        if ($this->option('dry-run')) {
            $this->table(
                ['Source', 'Type', 'URL', 'Last Collected', 'Platform'],
                $methods->map(fn ($m) => [
                    $m->source->name ?? '?',
                    $m->method_type,
                    mb_substr($m->endpoint_url ?? '', 0, 50),
                    $m->last_collected_at?->diffForHumans() ?? 'Never',
                    $m->source->detected_platform_slug ?? '?',
                ])->toArray()
            );

            return self::SUCCESS;
        }

        $bar = $this->output->createProgressBar($methods->count());
        $bar->start();

        $stats = ['success' => 0, 'failed' => 0, 'items' => 0];

        foreach ($methods as $method) {
            try {
                $items = $fetcher->fetch($method);
                $stats['success']++;
                $stats['items'] += count($items);
            } catch (Exception $e) {
                $stats['failed']++;
                $this->newLine();
                $this->warn("  Failed: {$method->source->name} — {$e->getMessage()}");
            }
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->table(
            ['Metric', 'Count'],
            [
                ['Sources Collected', $stats['success']],
                ['Sources Failed', $stats['failed']],
                ['Items Collected', $stats['items']],
            ]
        );

        return self::SUCCESS;
    }

    private function collectSingleSource(AdaptiveFetcherService $fetcher, string $sourceId): int
    {
        $method = CollectionMethod::where('source_id', $sourceId)
            ->enabled()
            ->with('source')
            ->first();

        if (! $method) {
            $this->error("No enabled collection method found for source: {$sourceId}");

            return self::FAILURE;
        }

        $this->info("Collecting from: {$method->source->name}");
        $this->info("Method: {$method->method_type} | URL: {$method->endpoint_url}");
        $this->info('Platform: '.($method->source->detected_platform_slug ?? 'unknown'));
        $this->newLine();

        try {
            $items = $fetcher->fetch($method);
            $count = count($items);
            $this->info("✅ Collected {$count} items.");
        } catch (Exception $e) {
            $this->error("Failed: {$e->getMessage()}");

            return self::FAILURE;
        }

        return self::SUCCESS;
    }
}
