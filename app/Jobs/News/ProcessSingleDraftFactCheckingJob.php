<?php

declare(strict_types=1);

namespace App\Jobs\News;

use App\Models\NewsArticleDraft;
use App\Models\Region;
use App\Services\News\FactCheckingService;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Throwable;

final class ProcessSingleDraftFactCheckingJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 180; // 3 minutes per draft

    public $tries = 1;

    public $failOnTimeout = true;

    public function __construct(
        public NewsArticleDraft $draft,
        public Region $region
    ) {}

    public function handle(FactCheckingService $factCheckingService): void
    {
        Log::info('Starting single draft fact-checking job', [
            'draft_id' => $this->draft->id,
            'region_id' => $this->region->id,
        ]);

        try {
            $factCheckingService->processSingleDraft($this->draft);

            Log::info('Completed single draft fact-checking job', [
                'draft_id' => $this->draft->id,
                'status' => $this->draft->status,
            ]);

            // Track completed jobs for this region
            $this->trackJobCompletion();
        } catch (Exception $e) {
            Log::error('Single draft fact-checking job failed', [
                'draft_id' => $this->draft->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    public function failed(Throwable $exception): void
    {
        Log::error('Single draft fact-checking job permanently failed', [
            'draft_id' => $this->draft->id,
            'region_id' => $this->region->id,
            'error' => $exception->getMessage(),
        ]);

        // Mark draft as rejected to prevent blocking workflow
        $this->draft->update([
            'status' => 'rejected',
            'rejection_reason' => 'Fact-checking job failed: '.$exception->getMessage(),
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
        $cacheKey = "draft_fact_checking_jobs:{$regionId}";

        // Atomically decrement the pending jobs counter
        $pendingJobs = Cache::decrement($cacheKey);

        Log::debug('Tracking draft fact-checking job completion', [
            'region_id' => $regionId,
            'draft_id' => $this->draft->id,
            'pending_jobs' => $pendingJobs,
        ]);

        // If this was the last job (counter hit 0), trigger Phase 5
        if ($pendingJobs !== false && $pendingJobs <= 0) {
            Log::info('Last draft fact-checking job completed - triggering Phase 5', [
                'region_id' => $regionId,
                'region_name' => $this->region->name,
            ]);

            // Clean up the cache key
            Cache::forget($cacheKey);

            // Dispatch Phase 5
            ProcessPhase5SelectionJob::dispatch($this->region);

            Log::info('Dispatched Phase 5 (selection) job', [
                'region_id' => $regionId,
            ]);
        }
    }
}
