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
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Performs final selection after all drafts have been evaluated (Phase 5).
 *
 * Selects top N drafts based on quality scores and marks them for generation.
 */
final class ProcessPhase5FinalSelectionJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 60; // 1 minute

    public $tries = 1;

    public $failOnTimeout = true;

    public function __construct(
        public Region $region
    ) {}

    public function handle(): void
    {
        Log::info('Phase 5: Starting final selection', [
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
        ]);

        try {
            $selectedCount = $this->performFinalSelection();

            Log::info('Phase 5: Completed final selection', [
                'region_id' => $this->region->id,
                'selected' => $selectedCount,
            ]);

            // Dispatch next phase
            ProcessPhase6GenerationJob::dispatch($this->region);
        } catch (Exception $e) {
            Log::error('Phase 5: Final selection failed', [
                'region_id' => $this->region->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    public function failed(Throwable $exception): void
    {
        Log::error('Phase 5: Final selection job permanently failed', [
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
            'error' => $exception->getMessage(),
        ]);
    }

    /**
     * Perform final selection of drafts based on quality scores.
     */
    private function performFinalSelection(): int
    {
        $articlesPerRegion = config('news-workflow.final_selection.articles_per_region', 5);
        $minQualityScore = config('news-workflow.final_selection.min_quality_score', 75);

        // Get all evaluated drafts (not rejected during evaluation)
        $drafts = NewsArticleDraft::where('region_id', $this->region->id)
            ->where('status', 'ready_for_generation')
            ->whereNotNull('quality_score')
            ->orderByDesc('quality_score')
            ->get();

        Log::info('Phase 5: Found evaluated drafts', [
            'region' => $this->region->name,
            'count' => $drafts->count(),
        ]);

        $evaluatedDrafts = $drafts->map(fn ($draft) => [
            'draft' => $draft,
            'quality_score' => $draft->quality_score,
        ])->toArray();

        // Filter by minimum quality score
        $qualifiedDrafts = array_filter(
            $evaluatedDrafts,
            fn ($item) => $item['quality_score'] >= $minQualityScore
        );

        // Select drafts: prioritize quality but ensure minimum count
        if (count($qualifiedDrafts) >= $articlesPerRegion) {
            $selectedDrafts = array_slice($qualifiedDrafts, 0, $articlesPerRegion);
        } else {
            // Take all qualified drafts plus lower-scoring ones to reach target
            $selectedDrafts = array_slice($evaluatedDrafts, 0, $articlesPerRegion);

            if (count($qualifiedDrafts) < $articlesPerRegion && count($evaluatedDrafts) < $articlesPerRegion) {
                Log::warning('Not enough drafts available to meet target count', [
                    'region' => $this->region->name,
                    'available' => count($evaluatedDrafts),
                    'target' => $articlesPerRegion,
                ]);
            }
        }

        $selectedCount = 0;

        // Mark selected drafts as selected for generation
        foreach ($selectedDrafts as $item) {
            $item['draft']->update(['status' => 'selected_for_generation']);
            $selectedCount++;

            Log::info('Draft selected for publishing', [
                'draft_id' => $item['draft']->id,
                'quality_score' => $item['quality_score'],
            ]);
        }

        // Reject remaining drafts
        foreach ($evaluatedDrafts as $item) {
            if ($item['draft']->status !== 'selected_for_generation') {
                $item['draft']->update([
                    'status' => 'rejected',
                    'rejection_reason' => 'Did not meet quality threshold or count limit',
                ]);
            }
        }

        return $selectedCount;
    }
}
