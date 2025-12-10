<?php

declare(strict_types=1);

namespace App\Jobs\News;

use App\Models\NewsFetchFrequency;
use App\Models\Region;
use App\Services\News\FetchFrequencyService;
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

final class ProcessSingleCategoryNewsCollectionJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 120; // 2 minutes per category

    public $tries = 1;

    public $failOnTimeout = true;

    public function __construct(
        public string $category,
        public Region $region
    ) {}

    public function handle(NewsCollectionService $newsCollection, FetchFrequencyService $frequencyService): void
    {
        Log::info('Starting single category news collection job', [
            'category' => $this->category,
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
        ]);

        try {
            $articles = $newsCollection->fetchSingleCategoryNews($this->region, $this->category);

            // Mark category as fetched (update last_fetched_at globally)
            $frequencyService->markCategoryFetched($this->category, NewsFetchFrequency::CATEGORY_TYPE_NEWS);

            Log::info('Completed single category news collection job', [
                'category' => $this->category,
                'region_id' => $this->region->id,
                'articles_collected' => count($articles),
            ]);

            // Track completed jobs for this region
            $this->trackJobCompletion();
        } catch (Exception $e) {
            Log::error('Single category news collection job failed', [
                'category' => $this->category,
                'region_id' => $this->region->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    public function failed(Throwable $exception): void
    {
        Log::error('Single category news collection job permanently failed', [
            'category' => $this->category,
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
            'error' => $exception->getMessage(),
        ]);

        // Track failed job to prevent blocking workflow
        $this->trackJobCompletion();
    }

    /**
     * Track job completion and trigger next phases if this is the last job
     */
    private function trackJobCompletion(): void
    {
        $regionId = $this->region->id;
        $cacheKey = "news_collection_jobs:{$regionId}";

        // Atomically decrement the pending jobs counter
        $pendingJobs = Cache::decrement($cacheKey);

        Log::debug('Tracking single category news job completion', [
            'category' => $this->category,
            'region_id' => $regionId,
            'pending_jobs' => $pendingJobs,
        ]);

        // If this was the last job (counter hit 0), trigger Phase 3
        if ($pendingJobs !== false && $pendingJobs <= 0) {
            Log::info('Last news collection job completed - triggering Phase 3', [
                'region_id' => $regionId,
                'region_name' => $this->region->name,
            ]);

            // Clean up the cache key
            Cache::forget($cacheKey);

            // Dispatch Phase 3 directly (which chains to 4 → 5 → 6 → 7)
            ProcessPhase3ShortlistingJob::dispatch($this->region);

            Log::info('Dispatched Phase 3 (shortlisting) job', [
                'region_id' => $regionId,
            ]);

            // Also dispatch Event Extraction (parallel pipeline)
            if (config('news-workflow.event_extraction.enabled', true)) {
                ProcessEventExtractionJob::dispatch($this->region);

                Log::info('Dispatched Event Extraction job (parallel pipeline)', [
                    'region_id' => $regionId,
                ]);
            }
        }
    }
}
