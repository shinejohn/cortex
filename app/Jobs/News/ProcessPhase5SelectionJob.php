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

/**
 * Dispatcher for Phase 5 - Quality Evaluation and Final Selection.
 *
 * Dispatches individual evaluation jobs for each draft, then triggers
 * final selection when all evaluations are complete.
 */
final class ProcessPhase5SelectionJob implements ShouldQueue
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
        Log::info('Phase 5: Starting quality evaluation dispatcher', [
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
        ]);

        try {
            $dispatchedCount = $this->dispatchEvaluationJobs();

            if ($dispatchedCount === 0) {
                Log::warning('Phase 5: No drafts to evaluate, skipping to Phase 6', [
                    'region_id' => $this->region->id,
                ]);

                ProcessPhase6GenerationJob::dispatch($this->region);
            }
        } catch (Exception $e) {
            Log::error('Phase 5: Evaluation dispatcher failed', [
                'region_id' => $this->region->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    public function failed(Throwable $exception): void
    {
        Log::error('Phase 5: Evaluation dispatcher job permanently failed', [
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
            'error' => $exception->getMessage(),
        ]);
    }

    /**
     * Dispatch individual evaluation jobs for each draft.
     */
    private function dispatchEvaluationJobs(): int
    {
        // Get drafts ready for evaluation (fact-checked)
        $drafts = NewsArticleDraft::where('region_id', $this->region->id)
            ->where('status', 'ready_for_generation')
            ->get();

        $draftCount = $drafts->count();

        if ($draftCount === 0) {
            return 0;
        }

        Log::info('Phase 5: Dispatching evaluation jobs', [
            'region_id' => $this->region->id,
            'draft_count' => $draftCount,
        ]);

        // Initialize counter for tracking job completion
        $cacheKey = "draft_evaluation_jobs:{$this->region->id}";
        Cache::put($cacheKey, $draftCount, now()->addHours(24));

        // Dispatch individual evaluation jobs
        foreach ($drafts as $draft) {
            ProcessSingleDraftEvaluationJob::dispatch($draft, $this->region);
        }

        Log::info('Phase 5: Dispatched all evaluation jobs', [
            'region_id' => $this->region->id,
            'count' => $draftCount,
        ]);

        return $draftCount;
    }
}
