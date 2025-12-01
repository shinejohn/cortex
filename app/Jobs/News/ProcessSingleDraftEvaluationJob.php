<?php

declare(strict_types=1);

namespace App\Jobs\News;

use App\Models\NewsArticleDraft;
use App\Models\Region;
use App\Services\News\PrismAiService;
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
 * Processes a single draft evaluation for quality scoring (Phase 5).
 *
 * Each draft is evaluated independently to avoid timeouts.
 * When all drafts are evaluated, triggers final selection.
 */
final class ProcessSingleDraftEvaluationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 120; // 2 minutes per evaluation

    public $tries = 1;

    public $failOnTimeout = true;

    public function __construct(
        public NewsArticleDraft $draft,
        public Region $region
    ) {}

    public function handle(PrismAiService $prismAi): void
    {
        Log::info('Phase 5: Starting single draft evaluation', [
            'draft_id' => $this->draft->id,
            'region_id' => $this->region->id,
        ]);

        try {
            $this->evaluateDraft($prismAi);

            Log::info('Phase 5: Completed single draft evaluation', [
                'draft_id' => $this->draft->id,
                'quality_score' => $this->draft->quality_score,
            ]);

            $this->trackJobCompletion();
        } catch (Exception $e) {
            Log::error('Phase 5: Single draft evaluation failed', [
                'draft_id' => $this->draft->id,
                'error' => $e->getMessage(),
            ]);

            // Mark as rejected instead of throwing to not block other drafts
            $this->draft->update([
                'status' => 'rejected',
                'rejection_reason' => 'Quality evaluation failed: '.$e->getMessage(),
            ]);

            $this->trackJobCompletion();
        }
    }

    public function failed(Throwable $exception): void
    {
        Log::error('Phase 5: Single draft evaluation job permanently failed', [
            'draft_id' => $this->draft->id,
            'region_id' => $this->region->id,
            'error' => $exception->getMessage(),
        ]);

        // Mark as rejected
        $this->draft->update([
            'status' => 'rejected',
            'rejection_reason' => 'Job failed: '.$exception->getMessage(),
        ]);

        // Still track completion to not block workflow
        $this->trackJobCompletion();
    }

    /**
     * Evaluate the draft quality using AI.
     */
    private function evaluateDraft(PrismAiService $prismAi): void
    {
        $draftData = [
            'id' => $this->draft->id,
            'title' => $this->draft->newsArticle->title,
            'outline' => $this->draft->outline,
            'fact_check_confidence' => $this->draft->fact_check_confidence,
            'relevance_score' => $this->draft->relevance_score,
        ];

        $evaluation = $prismAi->evaluateDraftQuality($draftData);

        $this->draft->update([
            'quality_score' => $evaluation['quality_score'],
            'fact_check_confidence' => $evaluation['fact_check_confidence'],
        ]);

        Log::debug('Phase 5: Draft evaluated', [
            'draft_id' => $this->draft->id,
            'quality_score' => $evaluation['quality_score'],
        ]);
    }

    /**
     * Track job completion and trigger final selection if this is the last job.
     */
    private function trackJobCompletion(): void
    {
        $regionId = $this->region->id;
        $cacheKey = "draft_evaluation_jobs:{$regionId}";

        $pendingJobs = Cache::decrement($cacheKey);

        Log::debug('Phase 5: Tracking draft evaluation job completion', [
            'region_id' => $regionId,
            'draft_id' => $this->draft->id,
            'pending_jobs' => $pendingJobs,
        ]);

        // If this was the last job, trigger final selection
        if ($pendingJobs !== false && $pendingJobs <= 0) {
            Log::info('Phase 5: Last evaluation job completed - triggering final selection', [
                'region_id' => $regionId,
                'region_name' => $this->region->name,
            ]);

            Cache::forget($cacheKey);

            ProcessPhase5FinalSelectionJob::dispatch($this->region);

            Log::info('Dispatched Phase 5 final selection job', [
                'region_id' => $regionId,
            ]);
        }
    }
}
