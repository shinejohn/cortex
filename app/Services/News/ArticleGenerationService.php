<?php

declare(strict_types=1);

namespace App\Services\News;

use App\Models\NewsArticleDraft;
use App\Models\Region;
use App\Services\WriterAgent\AgentAssignmentService;
use Exception;
use Illuminate\Support\Facades\Log;
use RuntimeException;

final class ArticleGenerationService
{
    public function __construct(
        private readonly PrismAiService $prismAi,
        private readonly UnsplashService $unsplash,
        private readonly AgentAssignmentService $agentAssignmentService
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

                // Merge writer_agent_id into ai_metadata for PublishingService
                $aiMetadata = $draft->ai_metadata ?? [];
                if ($articleData['writer_agent_id'] ?? null) {
                    $aiMetadata['writer_agent_id'] = $articleData['writer_agent_id'];
                }

                // Update draft with generated content
                $draft->update([
                    'generated_title' => $articleData['title'],
                    'generated_content' => $articleData['content'],
                    'generated_excerpt' => $articleData['excerpt'],
                    'seo_metadata' => $articleData['seo_metadata'],
                    'featured_image_url' => $articleData['featured_image_url'] ?? null,
                    'featured_image_path' => $articleData['featured_image_path'] ?? null,
                    'featured_image_disk' => $articleData['featured_image_disk'] ?? null,
                    'ai_metadata' => $aiMetadata,
                    'status' => 'ready_for_publishing',
                ]);

                $generatedCount++;

                Log::info('Generated article content', [
                    'draft_id' => $draft->id,
                    'title' => $articleData['title'],
                    'writer_agent_id' => $articleData['writer_agent_id'] ?? null,
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
        $region = Region::find($draft->region_id);

        // Find the best writer agent for this article
        $category = $this->mapTopicTagToCategory($draft->topic_tags[0] ?? null);
        $agent = $region ? $this->agentAssignmentService->findBestAgent($region, $category) : null;

        // Fallback to any active agent if no match found
        if (! $agent) {
            $agent = $this->agentAssignmentService->findAnyAgent();
        }

        $draftData = [
            'id' => $draft->id,
            'outline' => $draft->outline,
            'topic_tags' => $draft->topic_tags,
            'generated_title' => $sourceArticle->title,
            'source_title' => $sourceArticle->title,
            'source_content' => $sourceArticle->content_snippet,
            'source_publisher' => $sourceArticle->source_publisher,
            'published_at' => $sourceArticle->published_at?->toIso8601String(),
            'region_name' => $region?->name ?? 'Local Area',
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

        // Get writer agent style instructions if available
        $writerStyleInstructions = $agent?->style_instructions;

        if ($agent) {
            Log::debug('Using writer agent for article generation', [
                'draft_id' => $draft->id,
                'agent_id' => $agent->id,
                'agent_name' => $agent->name,
                'writing_style' => $agent->writing_style,
            ]);
        }

        $result = $this->prismAi->generateFinalArticle($draftData, $factChecks, $writerStyleInstructions);

        // Validate AI response has required fields
        if (! is_array($result) || ! isset($result['title'], $result['content'], $result['excerpt'])) {
            $keys = is_array($result) ? array_keys($result) : ['not_an_array'];

            throw new RuntimeException(
                'AI response missing required fields (title, content, excerpt). Got keys: '.implode(', ', $keys)
            );
        }

        // Generate SEO metadata
        $seoMetadata = $this->generateSeoMetadata($result['title'], $result['content'], $draft->topic_tags);
        $seoMetadata['keywords'] = array_merge($seoMetadata['keywords'], $result['seo_keywords'] ?? []);

        // Fetch a relevant image from Unsplash
        $imageData = $this->fetchArticleImage($result['title'], $draft->topic_tags ?? []);

        // Store image attribution in SEO metadata if available
        if ($imageData) {
            $seoMetadata['image_attribution'] = $imageData['attribution'] ?? null;
            $seoMetadata['image_photographer'] = $imageData['photographer_name'] ?? null;
            $seoMetadata['image_alt'] = $imageData['alt_description'] ?? $result['title'];
        }

        return [
            'title' => $result['title'],
            'content' => $result['content'],
            'excerpt' => $result['excerpt'],
            'seo_metadata' => $seoMetadata,
            'featured_image_url' => $imageData['url'] ?? null,
            'featured_image_path' => $imageData['storage_path'] ?? null,
            'featured_image_disk' => $imageData['storage_disk'] ?? null,
            'writer_agent_id' => $agent?->id,
        ];
    }

    /**
     * Map topic tag to valid DayNewsPost category
     */
    private function mapTopicTagToCategory(?string $topicTag): string
    {
        $mapping = [
            'local' => 'local_news',
            'business' => 'business',
            'sports' => 'sports',
            'entertainment' => 'entertainment',
            'community' => 'community',
            'education' => 'education',
            'health' => 'health',
            'politics' => 'politics',
            'crime' => 'crime',
            'weather' => 'weather',
            'events' => 'events',
            'obituary' => 'obituary',
            'missing_person' => 'missing_person',
            'emergency' => 'emergency',
            'public_notice' => 'public_notice',
        ];

        return $mapping[$topicTag] ?? 'local_news';
    }

    /**
     * Fetch a relevant image for the article from Unsplash.
     */
    private function fetchArticleImage(string $title, array $topicTags): ?array
    {
        if (! config('news-workflow.unsplash.enabled', true)) {
            return null;
        }

        // Build keywords from title and topic tags
        $titleKeywords = $this->extractKeywords($title);
        $keywords = array_merge($topicTags, $titleKeywords);

        $orientation = config('news-workflow.unsplash.orientation', 'landscape');

        $imageData = $this->unsplash->searchImage($keywords, $orientation);

        if ($imageData) {
            Log::debug('Fetched Unsplash image for article', [
                'title' => $title,
                'photo_id' => $imageData['photo_id'] ?? 'unknown',
            ]);

            return $imageData;
        }

        // Try with just topic tags if title keywords didn't work
        if (! empty($topicTags)) {
            $imageData = $this->unsplash->searchImage($topicTags, $orientation);

            if ($imageData) {
                return $imageData;
            }
        }

        // Fallback to a generic news/city image
        if (config('news-workflow.unsplash.fallback_enabled', true)) {
            return $this->unsplash->getRandomImage('local news city', $orientation);
        }

        return null;
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
