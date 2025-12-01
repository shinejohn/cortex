<?php

declare(strict_types=1);

namespace App\Jobs\News;

use App\Models\Region;
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

    public function handle(): void
    {
        Log::info('Starting category news collection dispatcher', [
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
        ]);

        try {
            // Get configured categories
            $categories = config('news-workflow.business_discovery.categories', []);

            if (empty($categories)) {
                Log::info('No categories configured, skipping category news collection', [
                    'region_id' => $this->region->id,
                ]);

                return;
            }

            Log::info('Dispatching category news collection jobs', [
                'region_id' => $this->region->id,
                'category_count' => count($categories),
            ]);

            // Dispatch a job for each category
            foreach ($categories as $category) {
                ProcessSingleCategoryNewsCollectionJob::dispatch($category, $this->region);
            }

            Log::info('Category news collection jobs dispatched', [
                'region_id' => $this->region->id,
                'jobs_dispatched' => count($categories),
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
