<?php

declare(strict_types=1);

namespace App\Jobs\News;

use App\Models\Region;
use App\Services\News\BusinessDiscoveryService;
use App\Services\News\SerpApiService;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Throwable;

final class ProcessSingleCategoryBusinessDiscoveryJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 120; // 2 minutes per category

    public $tries = 2;

    public $backoff = 30;

    public $failOnTimeout = true;

    public function __construct(
        public string $category,
        public Region $region
    ) {}

    public function handle(SerpApiService $serpApi, BusinessDiscoveryService $businessDiscovery): void
    {
        Log::info('Starting single category business discovery job', [
            'category' => $this->category,
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
        ]);

        try {
            // Fetch businesses for this single category
            $businessesData = $serpApi->discoverBusinessesForCategory($this->region, $this->category);

            $businessesCount = 0;

            // Store each business and link to region
            foreach ($businessesData as $businessData) {
                try {
                    $business = $businessDiscovery->upsertBusiness($businessData, $this->region);
                    $businessDiscovery->assignToRegion($business, $this->region);
                    $businessesCount++;
                } catch (Exception $e) {
                    Log::warning('Failed to store business', [
                        'business_name' => $businessData['name'] ?? 'Unknown',
                        'category' => $this->category,
                        'region' => $this->region->name,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            Log::info('Completed single category business discovery job', [
                'category' => $this->category,
                'region_id' => $this->region->id,
                'businesses_discovered' => $businessesCount,
            ]);

            // Track completed jobs for this region
            $this->trackJobCompletion();
        } catch (Exception $e) {
            Log::error('Single category business discovery job failed', [
                'category' => $this->category,
                'region_id' => $this->region->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    public function failed(Throwable $exception): void
    {
        Log::error('Single category business discovery job permanently failed', [
            'category' => $this->category,
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
            'error' => $exception->getMessage(),
        ]);

        // Track failed job to prevent blocking workflow
        $this->trackJobCompletion();
    }

    /**
     * Track job completion and log when all category jobs are done
     */
    private function trackJobCompletion(): void
    {
        $regionId = $this->region->id;
        $cacheKey = "business_discovery_jobs:{$regionId}";

        // Atomically decrement the pending jobs counter
        $pendingJobs = Cache::decrement($cacheKey);

        Log::debug('Tracking single category business discovery job completion', [
            'category' => $this->category,
            'region_id' => $regionId,
            'pending_jobs' => $pendingJobs,
        ]);

        // If this was the last job (counter hit 0), log completion
        if ($pendingJobs !== false && $pendingJobs <= 0) {
            Log::info('All business discovery jobs completed for region', [
                'region_id' => $regionId,
                'region_name' => $this->region->name,
            ]);

            // Clean up the cache key
            Cache::forget($cacheKey);
        }
    }
}
