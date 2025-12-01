<?php

declare(strict_types=1);

namespace App\Jobs\News;

use App\Models\NewsArticle;
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

final class ProcessSingleArticleScoringJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 180; // 3 minutes per article

    public $tries = 1;

    public $failOnTimeout = true;

    public function __construct(
        public NewsArticle $article,
        public Region $region
    ) {}

    public function handle(PrismAiService $prismAi): void
    {
        Log::info('Starting article scoring', [
            'article_id' => $this->article->id,
            'region_id' => $this->region->id,
            'title' => $this->article->title,
        ]);

        try {
            // Prepare article data for AI scoring
            $articleData = [
                'title' => $this->article->title,
                'content_snippet' => $this->article->content_snippet,
                'source_publisher' => $this->article->source_publisher,
                'published_at' => $this->article->published_at?->toIso8601String(),
                'source_type' => $this->article->source_type,
            ];

            // Score article with AI
            $scoringResult = $prismAi->scoreArticleRelevance($articleData, $this->region);

            // Store score in article model
            $this->article->update([
                'relevance_score' => $scoringResult['relevance_score'],
                'relevance_topic_tags' => $scoringResult['topic_tags'],
                'relevance_rationale' => $scoringResult['rationale'],
                'scored_at' => now(),
            ]);

            Log::info('Article scored successfully', [
                'article_id' => $this->article->id,
                'score' => $scoringResult['relevance_score'],
            ]);

            // Track job completion
            $this->trackJobCompletion();
        } catch (Exception $e) {
            Log::warning('Failed to score article', [
                'article_id' => $this->article->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    public function failed(Throwable $exception): void
    {
        Log::error('Article scoring job permanently failed', [
            'article_id' => $this->article->id,
            'region_id' => $this->region->id,
            'title' => $this->article->title,
            'error' => $exception->getMessage(),
        ]);

        // Mark with low score to not block workflow
        $this->article->update([
            'relevance_score' => 0,
            'scored_at' => now(),
        ]);

        // Track job completion to prevent workflow deadlock
        $this->trackJobCompletion();
    }

    /**
     * Track job completion and trigger selection if this is the last job
     */
    private function trackJobCompletion(): void
    {
        $cacheKey = "article_scoring_jobs:{$this->region->id}";

        // Atomically decrement the pending jobs counter
        $pendingJobs = Cache::decrement($cacheKey);

        Log::debug('Tracking article scoring job completion', [
            'region_id' => $this->region->id,
            'pending_jobs' => $pendingJobs,
        ]);

        // If this was the last job (counter hit 0), trigger selection
        if ($pendingJobs !== false && $pendingJobs <= 0) {
            Log::info('Last article scoring job completed - triggering selection', [
                'region_id' => $this->region->id,
                'region_name' => $this->region->name,
            ]);

            // Clean up the cache key
            Cache::forget($cacheKey);

            // Dispatch Phase 3 Selection job
            ProcessPhase3SelectionJob::dispatch($this->region);

            Log::info('Dispatched Phase 3 Selection job', [
                'region_id' => $this->region->id,
            ]);
        }
    }
}
