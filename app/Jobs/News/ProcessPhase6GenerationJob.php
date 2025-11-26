<?php

declare(strict_types=1);

namespace App\Jobs\News;

use App\Models\NewsArticleDraft;
use App\Models\Region;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Phase 6: Article Generation - Dispatches individual jobs for each article.
 *
 * This job dispatches ProcessSingleArticleGenerationJob for each draft,
 * and when all jobs complete, they will trigger Phase 7.
 *
 * If there are no drafts to process, it immediately dispatches Phase 7.
 */
final class ProcessPhase6GenerationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 60; // Quick job - just dispatches individual jobs

    public $tries = 1;

    public $failOnTimeout = true;

    public function __construct(
        public Region $region
    ) {}

    public function handle(): void
    {
        Log::info('Phase 6: Starting article generation dispatcher', [
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
        ]);

        if (! config('news-workflow.article_generation.enabled', true)) {
            Log::info('Phase 6: Article generation is disabled, skipping to Phase 7', [
                'region_id' => $this->region->id,
            ]);

            ProcessPhase7PublishingJob::dispatch($this->region);

            return;
        }

        // Get drafts selected for generation
        $drafts = NewsArticleDraft::where('region_id', $this->region->id)
            ->where('status', 'selected_for_generation')
            ->get();

        $draftCount = $drafts->count();

        Log::info('Phase 6: Found drafts for generation', [
            'region_id' => $this->region->id,
            'draft_count' => $draftCount,
        ]);

        // If no drafts to process, skip to Phase 7
        if ($draftCount === 0) {
            Log::info('Phase 6: No drafts to generate, skipping to Phase 7', [
                'region_id' => $this->region->id,
            ]);

            ProcessPhase7PublishingJob::dispatch($this->region);

            return;
        }

        // Initialize job counter in cache
        $cacheKey = "article_generation_jobs:{$this->region->id}";
        Cache::put($cacheKey, $draftCount, now()->addHours(24));

        Log::debug('Phase 6: Initialized job counter', [
            'cache_key' => $cacheKey,
            'job_count' => $draftCount,
        ]);

        // Dispatch individual jobs for each draft
        foreach ($drafts as $draft) {
            ProcessSingleArticleGenerationJob::dispatch($draft, $this->region);
        }

        Log::info('Phase 6: Dispatched article generation jobs', [
            'region_id' => $this->region->id,
            'jobs_dispatched' => $draftCount,
        ]);
    }

    public function failed(Throwable $exception): void
    {
        Log::error('Phase 6: Article generation dispatcher failed', [
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
            'error' => $exception->getMessage(),
        ]);
    }
}
