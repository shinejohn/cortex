<?php

declare(strict_types=1);

namespace App\Services\News;

use App\Models\NewsArticle;
use App\Models\NewsArticleDraft;
use App\Models\Region;
use Exception;
use Illuminate\Support\Facades\Log;

final class ContentCurationService
{
    public function __construct(
        private readonly PrismAiService $prismAi
    ) {}

    /**
     * Score and shortlist collected articles (Phase 3)
     *
     * Takes unprocessed NewsArticle records, scores them for local relevance
     * using AI, and creates NewsArticleDraft records for those above the
     * minimum relevance threshold.
     */
    public function shortlistArticles(Region $region): int
    {
        if (! config('news-workflow.shortlisting.enabled', true)) {
            Log::info('Shortlisting is disabled', ['region' => $region->name]);

            return 0;
        }

        $maxArticles = (int) config('news-workflow.shortlisting.articles_per_region', 10);
        $minRelevanceScore = (int) config('news-workflow.shortlisting.min_relevance_score', 60);
        $shortlistedCount = 0;

        Log::info('Starting content shortlisting', [
            'region' => $region->name,
            'max_articles' => $maxArticles,
            'min_relevance_score' => $minRelevanceScore,
        ]);

        $articles = NewsArticle::where('region_id', $region->id)
            ->where('processed', false)
            ->get();

        Log::info('Found unprocessed articles', [
            'region' => $region->name,
            'count' => $articles->count(),
        ]);

        $scored = [];

        foreach ($articles as $article) {
            try {
                $articleData = [
                    'title' => $article->title,
                    'content_snippet' => $article->content_snippet ?? $article->full_content ?? '',
                    'source_publisher' => $article->source_publisher,
                    'published_at' => $article->published_at?->toIso8601String(),
                ];

                $result = $this->prismAi->scoreArticleRelevance($articleData, $region);

                $article->update([
                    'relevance_score' => $result['relevance_score'],
                    'relevance_topic_tags' => $result['topic_tags'] ?? [],
                    'relevance_rationale' => $result['rationale'] ?? '',
                    'scored_at' => now(),
                    'processed' => true,
                ]);

                if ($result['relevance_score'] >= $minRelevanceScore) {
                    $scored[] = [
                        'article' => $article,
                        'relevance_score' => $result['relevance_score'],
                        'topic_tags' => $result['topic_tags'] ?? [],
                    ];
                }

                Log::debug('Scored article', [
                    'article_id' => $article->id,
                    'title' => $article->title,
                    'relevance_score' => $result['relevance_score'],
                    'passed' => $result['relevance_score'] >= $minRelevanceScore,
                ]);
            } catch (Exception $e) {
                Log::warning('Failed to score article', [
                    'article_id' => $article->id,
                    'title' => $article->title,
                    'error' => $e->getMessage(),
                ]);

                $article->update(['processed' => true]);
            }
        }

        // Sort by relevance score descending, take top N
        usort($scored, fn ($a, $b) => $b['relevance_score'] <=> $a['relevance_score']);
        $selected = array_slice($scored, 0, $maxArticles);

        // Create drafts for selected articles
        foreach ($selected as $item) {
            try {
                NewsArticleDraft::create([
                    'news_article_id' => $item['article']->id,
                    'region_id' => $region->id,
                    'status' => 'shortlisted',
                    'relevance_score' => $item['relevance_score'],
                    'topic_tags' => $item['topic_tags'],
                ]);

                $shortlistedCount++;

                Log::info('Shortlisted article', [
                    'article_id' => $item['article']->id,
                    'title' => $item['article']->title,
                    'relevance_score' => $item['relevance_score'],
                ]);
            } catch (Exception $e) {
                Log::warning('Failed to create draft for shortlisted article', [
                    'article_id' => $item['article']->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        Log::info('Shortlisting completed', [
            'region' => $region->name,
            'total_scored' => $articles->count(),
            'above_threshold' => count($scored),
            'shortlisted' => $shortlistedCount,
        ]);

        return $shortlistedCount;
    }

    /**
     * Perform final selection of articles (Phase 5)
     */
    public function finalSelection(Region $region): int
    {
        if (! config('news-workflow.final_selection.enabled', true)) {
            Log::info('Final selection is disabled', ['region' => $region->name]);

            return 0;
        }

        $articlesPerRegion = (int) config('news-workflow.final_selection.articles_per_region', 5);
        $minQualityScore = (int) config('news-workflow.final_selection.min_quality_score', 75);
        $selectedCount = 0;

        Log::info('Starting final selection', [
            'region' => $region->name,
            'target_count' => $articlesPerRegion,
            'min_quality_score' => $minQualityScore,
        ]);

        // Get drafts that are ready for generation (fact-checked)
        $drafts = NewsArticleDraft::where('region_id', $region->id)
            ->where('status', 'ready_for_generation')
            ->get();

        Log::info('Found fact-checked drafts', [
            'region' => $region->name,
            'count' => $drafts->count(),
        ]);

        $evaluatedDrafts = [];

        // Evaluate each draft
        foreach ($drafts as $draft) {
            try {
                $draftData = [
                    'id' => $draft->id,
                    'title' => $draft->newsArticle->title,
                    'outline' => $draft->outline,
                    'fact_check_confidence' => $draft->fact_check_confidence,
                    'relevance_score' => $draft->relevance_score,
                ];

                $evaluation = $this->prismAi->evaluateDraftQuality($draftData);

                $draft->update([
                    'quality_score' => $evaluation['quality_score'],
                    'fact_check_confidence' => $evaluation['fact_check_confidence'],
                ]);

                $evaluatedDrafts[] = [
                    'draft' => $draft,
                    'quality_score' => $evaluation['quality_score'],
                ];

                Log::debug('Evaluated draft', [
                    'draft_id' => $draft->id,
                    'quality_score' => $evaluation['quality_score'],
                ]);
            } catch (Exception $e) {
                Log::warning('Failed to evaluate draft', [
                    'draft_id' => $draft->id,
                    'error' => $e->getMessage(),
                ]);

                $draft->update([
                    'status' => 'rejected',
                    'rejection_reason' => 'Failed quality evaluation: '.$e->getMessage(),
                ]);
            }
        }

        // Sort by quality score descending
        usort($evaluatedDrafts, fn ($a, $b) => $b['quality_score'] <=> $a['quality_score']);

        // Select articles: prioritize quality but ensure minimum count
        $qualifiedDrafts = array_filter(
            $evaluatedDrafts,
            fn ($item) => $item['quality_score'] >= $minQualityScore
        );

        // If we have enough qualified drafts, use them
        if (count($qualifiedDrafts) >= $articlesPerRegion) {
            $selectedDrafts = array_slice($qualifiedDrafts, 0, $articlesPerRegion);
        } else {
            // Otherwise, take all qualified drafts plus lower-scoring ones to reach target
            $selectedDrafts = array_slice($evaluatedDrafts, 0, $articlesPerRegion);

            if (count($qualifiedDrafts) < $articlesPerRegion && count($evaluatedDrafts) < $articlesPerRegion) {
                Log::warning('Not enough drafts available to meet target count', [
                    'region' => $region->name,
                    'available' => count($evaluatedDrafts),
                    'target' => $articlesPerRegion,
                ]);
            }
        }

        // Mark selected drafts as selected for generation (Phase 6 will generate and mark ready_for_publishing)
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

        Log::info('Final selection completed', [
            'region' => $region->name,
            'selected' => $selectedCount,
        ]);

        return $selectedCount;
    }
}
