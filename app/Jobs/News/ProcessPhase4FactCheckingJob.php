<?php

declare(strict_types=1);

namespace App\Jobs\News;

use App\Models\NewsArticleDraft;
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

final class ProcessPhase4FactCheckingJob implements ShouldQueue
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
        Log::info('Phase 4: Starting fact-checking dispatcher', [
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
        ]);

        try {
            // Note: Even when fact-checking is disabled, we still need to dispatch
            // individual jobs to generate outlines for trust metrics evaluation.
            // The ProcessSingleDraftFactCheckingJob handles the disabled case correctly.

            // Get shortlisted drafts
            $drafts = NewsArticleDraft::where('region_id', $this->region->id)
                ->where('status', 'shortlisted')
                ->get();

            $totalDrafts = $drafts->count();

            // If no drafts to process, immediately trigger Phase 5
            if ($totalDrafts === 0) {
                Log::info('Phase 4: No drafts to fact-check, immediately triggering Phase 5', [
                    'region_id' => $this->region->id,
                ]);

                ProcessPhase5SelectionJob::dispatch($this->region);

                return;
            }

            // Initialize counter before dispatching jobs
            $this->initializeJobCounter($totalDrafts);

            // Dispatch fact-checking job for each draft
            foreach ($drafts as $draft) {
                ProcessSingleDraftFactCheckingJob::dispatch($draft, $this->region);
            }

            $factCheckingEnabled = config('news-workflow.fact_checking.enabled', true);

            Log::info('Phase 4: Outline generation and fact-checking jobs dispatched', [
                'region_id' => $this->region->id,
                'total_drafts' => $totalDrafts,
                'fact_checking_enabled' => $factCheckingEnabled,
            ]);

        } catch (Exception $e) {
            Log::error('Phase 4: Fact-checking dispatcher failed', [
                'region_id' => $this->region->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    public function failed(Throwable $exception): void
    {
        Log::error('Phase 4: Fact-checking job permanently failed', [
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
            'error' => $exception->getMessage(),
        ]);
    }

    /**
     * Initialize the cache counter for tracking all fact-checking jobs.
     */
    private function initializeJobCounter(int $totalDrafts): void
    {
        $cacheKey = "draft_fact_checking_jobs:{$this->region->id}";
        Cache::put($cacheKey, $totalDrafts, now()->addHours(24));

        Log::debug('Phase 4: Initialized job counter', [
            'cache_key' => $cacheKey,
            'job_count' => $totalDrafts,
        ]);
    }
}
