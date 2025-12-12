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
        // Refresh from DB to ensure latest data
        $this->draft->refresh();

        // Guard: Skip evaluation if outline is missing
        if (empty($this->draft->outline)) {
            Log::warning('Phase 5: Draft missing outline, skipping evaluation', [
                'draft_id' => $this->draft->id,
            ]);

            $this->draft->update([
                'status' => 'rejected',
                'rejection_reason' => 'Missing outline - cannot evaluate trust metrics',
            ]);

            // Note: Job completion is tracked in handle() after this method returns
            return;
        }

        $draftData = [
            'id' => $this->draft->id,
            'title' => $this->draft->newsArticle->title,
            'outline' => $this->draft->outline,
            'fact_check_confidence' => $this->draft->fact_check_confidence,
            'relevance_score' => $this->draft->relevance_score,
        ];

        $evaluation = $prismAi->evaluateDraftQuality($draftData);

        // Analyze trust metrics - include source publisher for credibility assessment
        $trustMetrics = $prismAi->analyzeTrustMetrics([
            'id' => $this->draft->id,
            'title' => $this->draft->newsArticle->title,
            'outline' => $this->draft->outline,
            'fact_checks' => $this->draft->factChecks->toArray(),
            'relevance_score' => $this->draft->relevance_score,
            'source_publisher' => $this->draft->newsArticle->source_publisher,
        ]);

        // Calculate derived metrics and overall score
        // Cast all values to float first since AI may return strings
        $rawFactConfidence = (float) ($evaluation['fact_check_confidence'] ?? 0);

        // If no fact-checks were performed, use a baseline of 75 (standard for curated news)
        // This prevents penalizing articles when fact-checking is disabled or failed
        $hasFactChecks = $this->draft->factChecks->isNotEmpty();
        $factAccuracy = $hasFactChecks && $rawFactConfidence > 0
            ? (int) round($rawFactConfidence)
            : 75; // Baseline for curated news from established sources

        $communityRelevance = (int) round((float) ($this->draft->relevance_score ?? 70));
        $biasLevel = (float) ($trustMetrics['bias_level'] ?? 70);
        $reliability = (float) ($trustMetrics['reliability'] ?? 70);
        $objectivity = (float) ($trustMetrics['objectivity'] ?? 70);
        $sourceQuality = (float) ($trustMetrics['source_quality'] ?? 70);

        $overallScore = (int) round(
            ($factAccuracy * 0.25) +
            ($biasLevel * 0.15) +
            ($reliability * 0.20) +
            ($objectivity * 0.15) +
            ($sourceQuality * 0.10) +
            ($communityRelevance * 0.15)
        );

        // Build trust metrics array
        $aiMetadata = $this->draft->ai_metadata ?? [];
        $aiMetadata['trust_metrics'] = [
            'fact_accuracy' => $factAccuracy,
            'bias_level' => (int) round($biasLevel),
            'reliability' => (int) round($reliability),
            'objectivity' => (int) round($objectivity),
            'source_quality' => (int) round($sourceQuality),
            'community_relevance' => $communityRelevance,
            'overall_score' => $overallScore,
            'analysis_rationale' => $trustMetrics['analysis_rationale'] ?? '',
        ];

        $this->draft->update([
            'quality_score' => $evaluation['quality_score'],
            'fact_check_confidence' => $evaluation['fact_check_confidence'],
            'ai_metadata' => $aiMetadata,
        ]);

        Log::debug('Phase 5: Draft evaluated with trust metrics', [
            'draft_id' => $this->draft->id,
            'quality_score' => $evaluation['quality_score'],
            'trust_overall' => $overallScore,
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
