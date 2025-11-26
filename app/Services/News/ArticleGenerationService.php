<?php

declare(strict_types=1);

namespace App\Services\News;

use App\Models\NewsArticleDraft;
use App\Models\Region;
use Exception;
use Illuminate\Support\Facades\Log;

final class ArticleGenerationService
{
    public function __construct(
        private readonly PrismAiService $prismAi
    ) {}

    /**
     * Generate full articles from drafts (Phase 6)
     */
    public function generateArticles(Region $region): int
    {
        if (! config('news-workflow.article_generation.enabled', true)) {
            Log::info('Article generation is disabled', ['region' => $region->name]);

            return 0;
        }

        $generatedCount = 0;

        Log::info('Starting article generation', [
            'region' => $region->name,
        ]);

        // Get drafts selected for generation (from Phase 5 final selection)
        $drafts = NewsArticleDraft::where('region_id', $region->id)
            ->where('status', 'selected_for_generation')
            ->with('newsArticle')
            ->get();

        Log::info('Found drafts ready for generation', [
            'region' => $region->name,
            'count' => $drafts->count(),
        ]);

        foreach ($drafts as $draft) {
            try {
                // Generate full article content
                $articleData = $this->generateArticle($draft);

                // Update draft with generated content
                $draft->update([
                    'generated_title' => $articleData['title'],
                    'generated_content' => $articleData['content'],
                    'generated_excerpt' => $articleData['excerpt'],
                    'seo_metadata' => $articleData['seo_metadata'],
                    'featured_image_url' => $articleData['featured_image_url'] ?? null,
                    'status' => 'ready_for_publishing',
                ]);

                $generatedCount++;

                Log::info('Generated article content', [
                    'draft_id' => $draft->id,
                    'title' => $articleData['title'],
                ]);
            } catch (Exception $e) {
                Log::error('Failed to generate article', [
                    'draft_id' => $draft->id,
                    'error' => $e->getMessage(),
                ]);

                $draft->update([
                    'status' => 'rejected',
                    'rejection_reason' => 'Article generation failed: '.$e->getMessage(),
                ]);
            }
        }

        Log::info('Article generation completed', [
            'region' => $region->name,
            'generated' => $generatedCount,
        ]);

        return $generatedCount;
    }

    /**
     * Generate full article from draft using AI
     */
    private function generateArticle(NewsArticleDraft $draft): array
    {
        $sourceArticle = $draft->newsArticle;

        $draftData = [
            'id' => $draft->id,
            'outline' => $draft->outline,
            'topic_tags' => $draft->topic_tags,
            'generated_title' => $sourceArticle->title,
            'source_title' => $sourceArticle->title,
            'source_content' => $sourceArticle->content_snippet,
            'source_publisher' => $sourceArticle->source_publisher,
            'published_at' => $sourceArticle->published_at?->toIso8601String(),
        ];

        $factChecks = $draft->factChecks()
            ->where('verification_result', 'verified')
            ->get()
            ->map(fn ($fc) => [
                'claim' => $fc->claim,
                'verification_result' => $fc->verification_result,
                'confidence_score' => $fc->confidence_score,
                'evidence' => $fc->scraped_evidence,
            ])
            ->toArray();

        $result = $this->prismAi->generateFinalArticle($draftData, $factChecks);

        // Generate SEO metadata
        $seoMetadata = $this->generateSeoMetadata($result['title'], $result['content'], $draft->topic_tags);
        $seoMetadata['keywords'] = array_merge($seoMetadata['keywords'], $result['seo_keywords'] ?? []);

        return [
            'title' => $result['title'],
            'content' => $result['content'],
            'excerpt' => $result['excerpt'],
            'seo_metadata' => $seoMetadata,
            'featured_image_url' => null, // Could be added later if image generation is implemented
        ];
    }

    /**
     * Generate SEO metadata for article
     */
    private function generateSeoMetadata(string $title, string $content, array $topicTags): array
    {
        // Extract first 160 characters for meta description
        $metaDescription = mb_substr(strip_tags($content), 0, 160);

        // Generate slug from title
        $slug = $this->generateSlug($title);

        // Generate keywords from topic tags and title
        $keywords = array_merge($topicTags, $this->extractKeywords($title));

        return [
            'meta_description' => $metaDescription,
            'slug' => $slug,
            'keywords' => array_unique($keywords),
            'og_title' => $title,
            'og_description' => $metaDescription,
        ];
    }

    /**
     * Generate URL-friendly slug from title
     */
    private function generateSlug(string $title): string
    {
        $slug = mb_strtolower($title);
        $slug = preg_replace('/[^a-z0-9\s-]/', '', $slug);
        $slug = preg_replace('/[\s-]+/', '-', $slug);

        return mb_trim($slug, '-');
    }

    /**
     * Extract keywords from title
     */
    private function extractKeywords(string $title): array
    {
        // Remove common stop words
        $stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];

        $words = explode(' ', mb_strtolower($title));
        $keywords = array_filter($words, fn ($word) => ! in_array($word, $stopWords) && mb_strlen($word) > 3);

        return array_values($keywords);
    }
}
