<?php

declare(strict_types=1);

namespace App\Jobs\News;

use App\Models\Region;
use App\Services\News\FetchFrequencyService;
use App\Services\News\NewsCollectionService;
use App\Services\News\WorkflowSettingsService;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Phase 2: News Collection - Dispatches jobs to collect news for businesses.
 *
 * This job dispatches ProcessBusinessNewsCollectionJob for each business,
 * and when all business jobs complete, they will trigger Phase 3.
 *
 * If there are no businesses, it immediately dispatches Phase 3.
 */
final class ProcessPhase2NewsCollectionJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 120; // 2 minutes (just for dispatching jobs + category news)

    public $tries = 1;

    public $failOnTimeout = true;

    public function __construct(
        public Region $region
    ) {}

    public function handle(
        NewsCollectionService $newsCollection,
        FetchFrequencyService $frequencyService,
        WorkflowSettingsService $workflowSettings
    ): void {
        Log::info('Phase 2: Starting news collection', [
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
        ]);

        try {
            // Check if news collection is enabled
            if (! config('news-workflow.news_collection.enabled', true)) {
                Log::info('Phase 2: News collection is disabled, skipping to Phase 3', [
                    'region_id' => $this->region->id,
                ]);

                // Skip directly to Phase 3
                ProcessPhase3ShortlistingJob::dispatch($this->region);

                return;
            }

            // Check if business sources should be skipped
            $skipBusinessSources = $workflowSettings->isPhaseEnabled('skip_business_sources');

            // Get categories that are due for fetching today (based on frequency settings)
            $categoriesToFetch = $frequencyService->getCategoriesForToday();
            $categoryJobsCount = $categoriesToFetch->count();

            // Get businesses linked to this region and filter by frequency (unless skipping)
            $businessJobsCount = 0;
            $businessesToFetch = collect();

            if (! $skipBusinessSources) {
                $allBusinesses = $this->region->businesses()
                    ->limit(50)
                    ->get();
                $businessesToFetch = $frequencyService->filterBusinessesByFrequency($allBusinesses);
                $businessJobsCount = $businessesToFetch->count();
            }

            $totalJobs = $categoryJobsCount + $businessJobsCount;

            Log::info('Phase 2: Filtered jobs by fetch frequency', [
                'region_id' => $this->region->id,
                'categories_total' => count(config('news-workflow.business_discovery.categories', [])),
                'categories_to_fetch' => $categoryJobsCount,
                'businesses_total' => $skipBusinessSources ? 0 : $this->region->businesses()->count(),
                'businesses_to_fetch' => $businessJobsCount,
                'skip_business_sources' => $skipBusinessSources,
            ]);

            // If no jobs will be dispatched, immediately trigger Phase 3
            if ($totalJobs === 0) {
                Log::info('Phase 2: No news collection jobs to dispatch (all categories up to date), triggering Phase 3', [
                    'region_id' => $this->region->id,
                ]);

                ProcessPhase3ShortlistingJob::dispatch($this->region);

                return;
            }

            // Initialize counter before dispatching jobs
            $this->initializeJobCounter($totalJobs);

            // Dispatch category news collection job (will filter internally)
            ProcessCategoryNewsCollectionJob::dispatch($this->region);

            // Dispatch business news collection jobs (only for businesses due for fetching)
            if (! $skipBusinessSources) {
                foreach ($businessesToFetch as $business) {
                    ProcessBusinessNewsCollectionJob::dispatch($business, $this->region);
                }
            }

            Log::info('Phase 2: News collection jobs dispatched', [
                'region_id' => $this->region->id,
                'category_jobs' => $categoryJobsCount,
                'business_jobs' => $businessJobsCount,
                'total_jobs' => $totalJobs,
                'skip_business_sources' => $skipBusinessSources,
            ]);

        } catch (Exception $e) {
            Log::error('Phase 2: News collection failed', [
                'region_id' => $this->region->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    public function failed(Throwable $exception): void
    {
        Log::error('Phase 2: News collection job permanently failed', [
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
            'error' => $exception->getMessage(),
        ]);
    }

    /**
     * Initialize the cache counter for tracking all news collection jobs.
     */
    private function initializeJobCounter(int $totalJobs): void
    {
        $cacheKey = "news_collection_jobs:{$this->region->id}";
        Cache::put($cacheKey, $totalJobs, now()->addHours(24));

        Log::debug('Phase 2: Initialized job counter', [
            'cache_key' => $cacheKey,
            'job_count' => $totalJobs,
        ]);
    }
}
