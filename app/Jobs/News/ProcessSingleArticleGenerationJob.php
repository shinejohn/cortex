<?php

declare(strict_types=1);

namespace App\Jobs\News;

use App\Models\NewsArticleDraft;
use App\Models\Region;
use App\Services\News\PrismAiService;
use App\Services\News\UnsplashService;
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
 * Processes a single article draft for generation (Phase 6).
 *
 * Each draft is processed independently to avoid timeouts.
 * When all drafts are processed, triggers Phase 7.
 */
final class ProcessSingleArticleGenerationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 180; // 3 minutes per article

    public $tries = 1;

    public $failOnTimeout = true;

    public function __construct(
        public NewsArticleDraft $draft,
        public Region $region
    ) {}

    public function handle(PrismAiService $prismAi, UnsplashService $unsplash): void
    {
        Log::info('Phase 6: Starting single article generation', [
            'draft_id' => $this->draft->id,
            'region_id' => $this->region->id,
        ]);

        try {
            $this->generateArticle($prismAi, $unsplash);

            Log::info('Phase 6: Completed single article generation', [
                'draft_id' => $this->draft->id,
                'title' => $this->draft->generated_title,
            ]);

            $this->trackJobCompletion();
        } catch (Exception $e) {
            Log::error('Phase 6: Single article generation failed', [
                'draft_id' => $this->draft->id,
                'error' => $e->getMessage(),
            ]);

            // Mark as rejected instead of throwing to not block other articles
            $this->draft->update([
                'status' => 'rejected',
                'rejection_reason' => 'Article generation failed: '.$e->getMessage(),
            ]);

            $this->trackJobCompletion();
        }
    }

    public function failed(Throwable $exception): void
    {
        Log::error('Phase 6: Single article generation job permanently failed', [
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
     * Generate the article content using AI.
     */
    private function generateArticle(PrismAiService $prismAi, UnsplashService $unsplash): void
    {
        $sourceArticle = $this->draft->newsArticle;

        $draftData = [
            'id' => $this->draft->id,
            'outline' => $this->draft->outline,
            'topic_tags' => $this->draft->topic_tags,
            'generated_title' => $sourceArticle->title,
            'source_title' => $sourceArticle->title,
            'source_content' => $sourceArticle->content_snippet,
            'source_publisher' => $sourceArticle->source_publisher,
            'published_at' => $sourceArticle->published_at?->toIso8601String(),
            'region_name' => $this->region->name,
        ];

        $factChecks = $this->draft->factChecks()
            ->where('verification_result', 'verified')
            ->get()
            ->map(fn ($fc) => [
                'claim' => $fc->claim,
                'verification_result' => $fc->verification_result,
                'confidence_score' => $fc->confidence_score,
                'evidence' => $fc->scraped_evidence,
            ])
            ->toArray();

        $result = $prismAi->generateFinalArticle($draftData, $factChecks);

        // Generate SEO metadata
        $seoMetadata = $this->generateSeoMetadata($result['title'], $result['content'], $this->draft->topic_tags ?? []);
        $seoMetadata['keywords'] = array_merge($seoMetadata['keywords'], $result['seo_keywords'] ?? []);

        // Fetch a relevant image from Unsplash
        $imageData = $this->fetchArticleImage($result['title'], $this->draft->topic_tags ?? [], $unsplash);

        // Store image attribution in SEO metadata if available
        if ($imageData) {
            $seoMetadata['image_attribution'] = $imageData['attribution'] ?? null;
            $seoMetadata['image_photographer'] = $imageData['photographer_name'] ?? null;
            $seoMetadata['image_alt'] = $imageData['alt_description'] ?? $result['title'];
        }

        // Update draft with generated content
        $this->draft->update([
            'generated_title' => $result['title'],
            'generated_content' => $result['content'],
            'generated_excerpt' => $result['excerpt'],
            'seo_metadata' => $seoMetadata,
            'featured_image_url' => $imageData['url'] ?? null,
            'status' => 'ready_for_publishing',
        ]);
    }

    /**
     * Fetch a relevant image for the article from Unsplash.
     */
    private function fetchArticleImage(string $title, array $topicTags, UnsplashService $unsplash): ?array
    {
        if (! config('news-workflow.unsplash.enabled', true)) {
            return null;
        }

        $titleKeywords = $this->extractKeywords($title);
        $keywords = array_merge($topicTags, $titleKeywords);
        $orientation = config('news-workflow.unsplash.orientation', 'landscape');

        $imageData = $unsplash->searchImage($keywords, $orientation);

        if ($imageData) {
            Log::debug('Fetched Unsplash image for article', [
                'draft_id' => $this->draft->id,
                'photo_id' => $imageData['photo_id'] ?? 'unknown',
            ]);

            return $imageData;
        }

        // Try with just topic tags if title keywords didn't work
        if (! empty($topicTags)) {
            $imageData = $unsplash->searchImage($topicTags, $orientation);

            if ($imageData) {
                return $imageData;
            }
        }

        // Fallback to a generic news/city image
        if (config('news-workflow.unsplash.fallback_enabled', true)) {
            return $unsplash->getRandomImage('local news city', $orientation);
        }

        return null;
    }

    /**
     * Generate SEO metadata for article.
     */
    private function generateSeoMetadata(string $title, string $content, array $topicTags): array
    {
        $metaDescription = mb_substr(strip_tags($content), 0, 160);
        $slug = $this->generateSlug($title);
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
     * Generate URL-friendly slug from title.
     */
    private function generateSlug(string $title): string
    {
        $slug = mb_strtolower($title);
        $slug = preg_replace('/[^a-z0-9\s-]/', '', $slug);
        $slug = preg_replace('/[\s-]+/', '-', $slug);

        return mb_trim($slug, '-');
    }

    /**
     * Extract keywords from title.
     */
    private function extractKeywords(string $title): array
    {
        $stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
        $words = explode(' ', mb_strtolower($title));
        $keywords = array_filter($words, fn ($word) => ! in_array($word, $stopWords) && mb_strlen($word) > 3);

        return array_values($keywords);
    }

    /**
     * Track job completion and trigger Phase 7 if this is the last job.
     */
    private function trackJobCompletion(): void
    {
        $regionId = $this->region->id;
        $cacheKey = "article_generation_jobs:{$regionId}";

        $pendingJobs = Cache::decrement($cacheKey);

        Log::debug('Phase 6: Tracking article generation job completion', [
            'region_id' => $regionId,
            'draft_id' => $this->draft->id,
            'pending_jobs' => $pendingJobs,
        ]);

        // If this was the last job, trigger Phase 7
        if ($pendingJobs !== false && $pendingJobs <= 0) {
            Log::info('Phase 6: Last article generation job completed - triggering Phase 7', [
                'region_id' => $regionId,
                'region_name' => $this->region->name,
            ]);

            Cache::forget($cacheKey);

            ProcessPhase7PublishingJob::dispatch($this->region);

            Log::info('Dispatched Phase 7 (publishing) job', [
                'region_id' => $regionId,
            ]);
        }
    }
}
