<?php

declare(strict_types=1);

namespace App\Jobs\News;

use App\Models\Region;
use App\Services\News\NewsCollectionService;
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

    public function handle(NewsCollectionService $newsCollection): void
    {
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

            // Fetch category news synchronously (smaller dataset, quick)
            $categoryArticles = $newsCollection->fetchCategoryNews($this->region);

            Log::info('Phase 2: Category news collected', [
                'region_id' => $this->region->id,
                'category_articles' => count($categoryArticles),
            ]);

            // Dispatch business news collection jobs
            $businessJobsCount = $this->dispatchBusinessNewsJobs($newsCollection);

            Log::info('Phase 2: Business news jobs dispatched', [
                'region_id' => $this->region->id,
                'business_jobs' => $businessJobsCount,
            ]);

            // If no business jobs were dispatched, immediately trigger Phase 3
            if ($businessJobsCount === 0) {
                Log::info('Phase 2: No businesses found, immediately triggering Phase 3', [
                    'region_id' => $this->region->id,
                ]);

                ProcessPhase3ShortlistingJob::dispatch($this->region);
            }
            // Otherwise, ProcessBusinessNewsCollectionJob will trigger Phase 3
            // when all business jobs complete

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
     * Dispatch jobs to collect news for all businesses in the region.
     *
     * Returns the number of jobs dispatched.
     */
    private function dispatchBusinessNewsJobs(NewsCollectionService $newsCollection): int
    {
        // Get businesses linked to this region
        $businesses = $this->region->businesses()
            ->limit(50) // Limit to avoid overwhelming API
            ->get();

        $businessCount = $businesses->count();

        if ($businessCount === 0) {
            return 0;
        }

        // Initialize job counter in cache for automatic workflow triggering
        $cacheKey = "news_collection_jobs:{$this->region->id}";
        Cache::put($cacheKey, $businessCount, now()->addHours(24));

        Log::debug('Phase 2: Initialized job counter', [
            'cache_key' => $cacheKey,
            'job_count' => $businessCount,
        ]);

        $jobsDispatched = 0;

        foreach ($businesses as $business) {
            ProcessBusinessNewsCollectionJob::dispatch($business, $this->region);
            $jobsDispatched++;
        }

        return $jobsDispatched;
    }
}
