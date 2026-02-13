<?php

declare(strict_types=1);

namespace App\Services\News;

use App\Models\DayNewsPost;
use App\Models\NewsArticleDraft;
use App\Models\RawContent;
use App\Models\Region;
use App\Services\MediaLibraryService;
use App\Services\WriterAgent\AgentAssignmentService;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use RuntimeException;

final class ArticleGenerationService
{
    public function __construct(
        private readonly PrismAiService $prismAi,
        private readonly MediaLibraryService $mediaLibrary,
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

    // =========================================================================
    // NEWSROOM TIER-BASED GENERATION
    // =========================================================================

    public function generateBrief(RawContent $content): DayNewsPost
    {
        return $this->generateFromRaw($content, RawContent::TIER_BRIEF);
    }

    public function generateStandard(RawContent $content): DayNewsPost
    {
        return $this->generateFromRaw($content, RawContent::TIER_STANDARD);
    }

    public function generateFull(RawContent $content): DayNewsPost
    {
        return $this->generateFromRaw($content, RawContent::TIER_FULL);
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

        // Fetch a relevant image (local first, then Unsplash)
        $mediaAsset = $this->fetchArticleImage(
            $result['title'],
            $draft->topic_tags ?? [],
            $draft->region_id,
            $draft->newsArticle?->business_id
        );

        $imageData = $mediaAsset?->toArticleImageData();

        if ($mediaAsset) {
            $mediaAsset->recordUsage('news_article_draft', $draft->id);
        }

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
     * Fetch a relevant image for the article (local library first, then Unsplash).
     */
    private function fetchArticleImage(
        string $title,
        array $topicTags,
        ?string $regionId = null,
        ?string $businessId = null,
    ): ?\App\Models\MediaAsset {
        if (! config('news-workflow.unsplash.enabled', true)) {
            return null;
        }

        $titleKeywords = $this->extractKeywords($title);
        $keywords = array_merge($topicTags, $titleKeywords);

        $mediaAsset = $this->mediaLibrary->findImageForArticle(
            keywords: $keywords,
            regionId: $regionId,
            businessId: $businessId,
        );

        if ($mediaAsset) {
            Log::debug('Fetched image for article', [
                'title' => $title,
                'asset_id' => $mediaAsset->id,
                'source' => $mediaAsset->source_type,
            ]);
        }

        return $mediaAsset;
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

    private function generateFromRaw(RawContent $content, string $tier): DayNewsPost
    {
        Log::info("Generating {$tier} article from RawContent", ['id' => $content->id]);

        // 1. Prepare Data
        $draftData = [
            'id' => $content->id,
            'region_name' => $content->source->region->name ?? 'Local Area',
            'generated_title' => $content->title,
            'source_title' => $content->title,
            'source_content' => $content->body, // Assuming body contains the text
            'source_publisher' => $content->source->name ?? 'Unknown Source',
            'published_at' => $content->published_at?->toIso8601String(),
            'outline' => "Generate a {$tier} news article based on the provided content.",
        ];

        // 2. Determine Length/Style based on Tier
        $instructions = match ($tier) {
            RawContent::TIER_BRIEF => 'Write a concise 100-200 word summary. Focus on the key facts: Who, What, When, Where. Direct tone.',
            RawContent::TIER_FULL => 'Write a comprehensive 500-1000 word article. Include deep context, analysis, and a professional journalistic tone.',
            default => 'Write a standard 300-500 word news article. Balanced tone, covering all main points.',
        };

        // 3. Generate with Prism
        // We reuse generateFinalArticle but pass specific instructions
        $result = $this->prismAi->generateFinalArticle($draftData, [], $instructions);

        // 4. Create DayNewsPost
        // Map category
        $category = 'local_news'; // Default or derive from content classification
        if ($content->classification_data && isset($content->classification_data['category'])) {
            // Map RawContent category to DayNewsPost category if needed
            $category = $this->mapTopicTagToCategory($content->classification_data['category']);
        }

        // Generate SEO & Image
        $seoMetadata = $this->generateSeoMetadata($result['title'], $result['content'], $result['seo_keywords'] ?? []);

        $tags = $result['seo_keywords'] ?? [];
        $regionId = $content->source->region_id ?? null;
        $mediaAsset = $this->fetchArticleImage($result['title'], $tags, $regionId, null);
        $imageData = $mediaAsset?->toArticleImageData();

        $post = DayNewsPost::create([
            'title' => $result['title'],
            'slug' => $seoMetadata['slug'].'-'.Str::random(6),
            'content' => $result['content'],
            'excerpt' => $result['excerpt'],
            'category' => $category,
            'status' => 'draft', // Auto-publish logic can handle status change later
            'featured_image' => $imageData['url'] ?? null,
            'featured_image_path' => $imageData['storage_path'] ?? null,
            'featured_image_disk' => $imageData['storage_disk'] ?? null,
            'metadata' => [
                'meta_description' => $seoMetadata['meta_description'],
                'meta_keywords' => $seoMetadata['keywords'],
            ],
            'author_id' => 1, // System user or unassigned
            'published_at' => now(), // Setup for immediate publishing if approved
        ]);

        if ($content->source?->region_id) {
            $post->regions()->attach($content->source->region_id);
        }

        if ($mediaAsset) {
            $mediaAsset->recordUsage('day_news_post', $post->id);
        }

        return $post;
    }
}
