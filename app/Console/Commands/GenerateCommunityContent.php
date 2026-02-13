<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\City;
use App\Services\AlphaSite\CommunityContentService;
use Exception;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Builder;

final class GenerateCommunityContent extends Command
{
    protected $signature = 'community:generate-content
                            {--city= : Generate content for a specific city by slug}
                            {--state= : Generate content for all cities in a state (e.g. FL, TX)}
                            {--limit=10 : Maximum number of cities to process}
                            {--force : Regenerate content even if it already exists}';

    protected $description = 'Generate AI-powered community content for city and city+category pages';

    public function handle(CommunityContentService $contentService): int
    {
        $citySlug = $this->option('city');
        $state = $this->option('state');
        $limit = (int) $this->option('limit');
        $force = (bool) $this->option('force');

        $query = City::active();

        if ($citySlug) {
            $query->where('slug', $citySlug);
        }

        if ($state) {
            $query->where('state', mb_strtoupper($state));
        }

        if (! $force) {
            $query->where(function (Builder $q) {
                $q->whereNull('content_generated_at')
                    ->orWhere('content_generated_at', '<', now()->subMonths(3));
            });
        }

        $cities = $query->orderBy('name')->limit($limit)->get();

        if ($cities->isEmpty()) {
            $this->info('No cities found matching the given criteria.');

            return Command::SUCCESS;
        }

        $this->info("Processing {$cities->count()} cities...");
        $this->newLine();

        $bar = $this->output->createProgressBar($cities->count());
        $bar->start();

        $successCount = 0;
        $errorCount = 0;

        foreach ($cities as $city) {
            try {
                $categoriesProcessed = $contentService->generateAllContentForCity($city);
                $successCount++;

                $this->line(" {$city->display_name} - {$categoriesProcessed} categories processed");
            } catch (Exception $e) {
                $errorCount++;
                $this->error(" Failed: {$city->display_name} - {$e->getMessage()}");
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->table(
            ['Result', 'Count'],
            [
                ['Cities Processed', $successCount],
                ['Errors', $errorCount],
                ['Total', $cities->count()],
            ]
        );

        if ($errorCount > 0) {
            $this->warn('Some cities failed to generate content. Check logs for details.');
        }

        return Command::SUCCESS;
    }
}
