<?php

declare(strict_types=1);

namespace App\Jobs\News;

use App\Models\Business;
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

final class ProcessBusinessNewsCollectionJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 60; // 1 minute per business

    public $tries = 1;

    public $failOnTimeout = true;

    public function __construct(
        public Business $business,
        public Region $region
    ) {}

    public function handle(NewsCollectionService $newsCollection): void
    {
        Log::info('Starting news collection job for business', [
            'business_id' => $this->business->id,
            'business_name' => $this->business->name,
            'region_id' => $this->region->id,
        ]);

        try {
            $articles = $newsCollection->fetchNewsForBusiness($this->business, $this->region);

            Log::info('Completed news collection job for business', [
                'business_id' => $this->business->id,
                'articles_collected' => count($articles),
            ]);

            // Track completed jobs for this region
            $this->trackJobCompletion();
        } catch (Exception $e) {
            Log::error('News collection job failed for business', [
                'business_id' => $this->business->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    public function failed(Throwable $exception): void
    {
        Log::error('News collection job permanently failed', [
            'business_id' => $this->business->id,
            'business_name' => $this->business->name,
            'region_id' => $this->region->id,
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

        Log::debug('Tracking job completion', [
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
