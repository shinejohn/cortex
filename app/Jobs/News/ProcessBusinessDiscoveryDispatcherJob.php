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
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Throwable;

final class ProcessBusinessDiscoveryDispatcherJob implements ShouldQueue
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
        if (! config('news-workflow.business_discovery.enabled', true)) {
            Log::info('Business discovery is disabled, skipping', [
                'region_id' => $this->region->id,
                'region_name' => $this->region->name,
            ]);

            return;
        }

        Log::info('Starting business discovery dispatcher', [
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
        ]);

        try {
            $categories = config('news-workflow.business_discovery.categories', []);

            if (empty($categories)) {
                Log::warning('No categories configured for business discovery', [
                    'region_id' => $this->region->id,
                ]);

                return;
            }

            $categoryCount = count($categories);

            // Initialize the cache counter for tracking job completion
            $cacheKey = "business_discovery_jobs:{$this->region->id}";
            Cache::put($cacheKey, $categoryCount, now()->addHours(24));

            Log::info('Dispatching business discovery jobs for categories', [
                'region_id' => $this->region->id,
                'total_categories' => $categoryCount,
            ]);

            // Dispatch a job for each category
            foreach ($categories as $category) {
                ProcessSingleCategoryBusinessDiscoveryJob::dispatch($category, $this->region);
            }

            Log::info('Business discovery jobs dispatched', [
                'region_id' => $this->region->id,
                'jobs_dispatched' => $categoryCount,
            ]);

        } catch (Exception $e) {
            Log::error('Business discovery dispatcher failed', [
                'region_id' => $this->region->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    public function failed(Throwable $exception): void
    {
        Log::error('Business discovery dispatcher permanently failed', [
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
            'error' => $exception->getMessage(),
        ]);
    }
}
