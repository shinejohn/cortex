<?php

declare(strict_types=1);

namespace App\Jobs\News;

use App\Models\Region;
use App\Services\News\FetchFrequencyService;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

final class ProcessCategoryNewsCollectionJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 60; // 1 minute (just for dispatching jobs)

    public $tries = 1;

    public $failOnTimeout = true;

    public function __construct(
        public Region $region
    ) {}

    public function handle(FetchFrequencyService $frequencyService): void
    {
        Log::info('Starting category news collection dispatcher', [
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
        ]);

        try {
            // Get categories that are due for fetching today (based on frequency settings)
            $categoriesToFetch = $frequencyService->getCategoriesForToday();

            if ($categoriesToFetch->isEmpty()) {
                Log::info('No categories due for fetching today, skipping category news collection', [
                    'region_id' => $this->region->id,
                ]);

                return;
            }

            Log::info('Dispatching category news collection jobs (filtered by frequency)', [
                'region_id' => $this->region->id,
                'total_categories' => count(config('news-workflow.business_discovery.categories', [])),
                'categories_to_fetch' => $categoriesToFetch->count(),
            ]);

            // Dispatch a job for each category that is due
            foreach ($categoriesToFetch as $category) {
                ProcessSingleCategoryNewsCollectionJob::dispatch($category, $this->region);
            }

            Log::info('Category news collection jobs dispatched', [
                'region_id' => $this->region->id,
                'jobs_dispatched' => $categoriesToFetch->count(),
            ]);

        } catch (Exception $e) {
            Log::error('Category news collection dispatcher failed', [
                'region_id' => $this->region->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    public function failed(Throwable $exception): void
    {
        Log::error('Category news collection dispatcher permanently failed', [
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
            'error' => $exception->getMessage(),
        ]);

        // Note: No counter decrement here - the dispatcher just dispatches jobs
        // The individual category worker jobs will decrement the counter
    }
}
