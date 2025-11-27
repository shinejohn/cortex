<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Region;
use App\Services\News\EventExtractionService;
use Illuminate\Console\Command;

final class RunEventExtractionCommand extends Command
{
    protected $signature = 'news:extract-events
                            {--region= : Specific region ID to process}
                            {--all : Process all active regions}';

    protected $description = 'Run event extraction pipeline on collected news articles';

    public function handle(EventExtractionService $service): int
    {
        $regionId = $this->option('region');
        $processAll = $this->option('all');

        if (! $regionId && ! $processAll) {
            $this->error('Please specify --region=<id> or --all');

            return Command::FAILURE;
        }

        if (! config('news-workflow.event_extraction.enabled', true)) {
            $this->warn('Event extraction is disabled in configuration.');

            return Command::SUCCESS;
        }

        if ($regionId) {
            return $this->processRegion($service, $regionId);
        }

        return $this->processAllRegions($service);
    }

    private function processRegion(EventExtractionService $service, string $regionId): int
    {
        $region = Region::find($regionId);

        if (! $region) {
            $this->error("Region not found: {$regionId}");

            return Command::FAILURE;
        }

        $this->info("Processing region: {$region->name}");

        $stats = $service->extractEventsForRegion($region);

        $this->displayStats($stats);

        return Command::SUCCESS;
    }

    private function processAllRegions(EventExtractionService $service): int
    {
        $regions = Region::where('is_active', true)->get();

        if ($regions->isEmpty()) {
            $this->warn('No active regions found.');

            return Command::SUCCESS;
        }

        $this->info("Processing {$regions->count()} regions...");
        $this->newLine();

        $totalStats = [
            'detected' => 0,
            'extracted' => 0,
            'validated' => 0,
            'published' => 0,
            'rejected' => 0,
        ];

        foreach ($regions as $region) {
            $this->info("Processing: {$region->name}");

            $stats = $service->extractEventsForRegion($region);

            $this->line("  Detected: {$stats['detected']}, Extracted: {$stats['extracted']}, Published: {$stats['published']}");

            foreach ($totalStats as $key => $value) {
                $totalStats[$key] += $stats[$key] ?? 0;
            }
        }

        $this->newLine();
        $this->info('=== Total Results ===');
        $this->displayStats($totalStats);

        return Command::SUCCESS;
    }

    private function displayStats(array $stats): void
    {
        $this->table(
            ['Metric', 'Count'],
            [
                ['Events Detected', $stats['detected']],
                ['Events Extracted', $stats['extracted']],
                ['Events Validated', $stats['validated']],
                ['Events Published', $stats['published']],
                ['Events Rejected', $stats['rejected']],
            ]
        );
    }
}
