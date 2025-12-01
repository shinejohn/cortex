<?php

declare(strict_types=1);

namespace App\Jobs\News;

use App\Models\NewsArticle;
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

final class ProcessPhase3SelectionJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 60; // 1 minute (no AI calls, just database operations)

    public $tries = 1;

    public $failOnTimeout = true;

    public function __construct(
        public Region $region
    ) {}

    public function handle(): void
    {
        Log::info('Phase 3 Selection: Starting final article selection', [
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
        ]);

        try {
            $articlesPerRegion = config('news-workflow.shortlisting.articles_per_region', 10);
            $minRelevanceScore = config('news-workflow.shortlisting.min_relevance_score', 60);

            // Get all scored articles for this region
            $articles = NewsArticle::where('region_id', $this->region->id)
                ->scored()
                ->where('processed', false)
                ->orderByDesc('relevance_score')
                ->get();

            Log::info('Phase 3 Selection: Found scored articles', [
                'region_id' => $this->region->id,
                'count' => $articles->count(),
            ]);

            // Apply selection logic
            $selectedArticles = $this->selectArticles($articles, $articlesPerRegion, $minRelevanceScore);

            Log::info('Phase 3 Selection: Selected articles', [
                'region_id' => $this->region->id,
                'selected' => count($selectedArticles),
                'target' => $articlesPerRegion,
            ]);

            // Create drafts for selected articles
            $shortlistedCount = 0;
            foreach ($selectedArticles as $article) {
                try {
                    $draft = NewsArticleDraft::create([
                        'news_article_id' => $article->id,
                        'region_id' => $this->region->id,
                        'status' => 'shortlisted',
                        'relevance_score' => $article->relevance_score,
                        'topic_tags' => $article->relevance_topic_tags,
                    ]);

                    $article->markAsProcessed();
                    $shortlistedCount++;

                    Log::info('Phase 3 Selection: Article shortlisted', [
                        'draft_id' => $draft->id,
                        'article_id' => $article->id,
                        'score' => $article->relevance_score,
                    ]);
                } catch (Exception $e) {
                    Log::warning('Phase 3 Selection: Failed to create draft', [
                        'article_id' => $article->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            // Mark remaining unselected articles as processed
            NewsArticle::where('region_id', $this->region->id)
                ->where('processed', false)
                ->update(['processed' => true]);

            Log::info('Phase 3 Selection: Completed article selection', [
                'region_id' => $this->region->id,
                'shortlisted' => $shortlistedCount,
            ]);

            // Dispatch next phase
            ProcessPhase4FactCheckingJob::dispatch($this->region);
        } catch (Exception $e) {
            Log::error('Phase 3 Selection: Failed', [
                'region_id' => $this->region->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    public function failed(Throwable $exception): void
    {
        Log::error('Phase 3 Selection: Job permanently failed', [
            'region_id' => $this->region->id,
            'region_name' => $this->region->name,
            'error' => $exception->getMessage(),
        ]);
    }

    /**
     * Select articles based on relevance score and target count
     */
    private function selectArticles($articles, int $articlesPerRegion, float $minRelevanceScore): array
    {
        // Filter articles that meet the minimum relevance score
        $qualifiedArticles = $articles->filter(
            fn ($article) => $article->relevance_score >= $minRelevanceScore
        )->all();

        // If we have enough qualified articles, use them
        if (count($qualifiedArticles) >= $articlesPerRegion) {
            return array_slice($qualifiedArticles, 0, $articlesPerRegion);
        }

        // Otherwise, take all articles up to target count (regardless of score)
        $allArticles = $articles->all();
        $selectedArticles = array_slice($allArticles, 0, $articlesPerRegion);

        if (count($allArticles) < $articlesPerRegion) {
            Log::warning('Phase 3 Selection: Not enough articles available to meet target count', [
                'region_id' => $this->region->id,
                'region_name' => $this->region->name,
                'available' => count($allArticles),
                'qualified' => count($qualifiedArticles),
                'target' => $articlesPerRegion,
            ]);
        }

        return $selectedArticles;
    }
}
