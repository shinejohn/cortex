<?php

declare(strict_types=1);

namespace App\Services\Newsroom;

use App\Models\DayNewsPost;
use App\Models\FillerArticle;
use App\Models\FillerBucket;
use App\Models\Region;
use App\Services\News\PrismAiService;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

final class FillerBucketService
{
    public function __construct(
        private readonly PrismAiService $ai,
        private readonly SearchTrendMiningService $searchTrends,
        private readonly TrendDetectionService $trendDetection,
    ) {}

    /**
     * Deploy filler articles for regions below their daily publishing target.
     * Called by scheduled job after the main daily workflow completes.
     */
    public function deployForAllRegions(): array
    {
        $stats = ['regions' => 0, 'deployed' => 0];
        $target = (int) config('news-workflow.business_content.publishing.daily_target', 3);

        foreach (Region::where('is_active', true)->get() as $region) {
            $published = DayNewsPost::whereHas('regions', fn ($q) => $q->where('region_id', $region->id))
                ->whereDate('created_at', today())
                ->count();

            $deficit = $target - $published;
            if ($deficit <= 0) {
                continue;
            }

            $deployed = $this->deployForRegion($region, $deficit);
            $stats['regions']++;
            $stats['deployed'] += $deployed;
        }

        return $stats;
    }

    /**
     * Deploy up to $count filler articles for a region.
     */
    public function deployForRegion(Region $region, int $count): int
    {
        $deployed = 0;
        $articles = FillerArticle::ready()
            ->where('region_id', $region->id)
            ->limit($count)
            ->with('bucket')
            ->get();

        foreach ($articles as $article) {
            try {
                $post = DayNewsPost::create([
                    'title' => $article->title,
                    'content' => $article->content,
                    'excerpt' => $article->excerpt,
                    'featured_image' => $article->featured_image_url,
                    'status' => 'published',
                    'published_at' => now(),
                    'category' => 'business',
                    'type' => 'article',
                    'slug' => $this->ensureUniqueSlug(Str::slug($article->title)),
                    'metadata' => array_merge($article->seo_metadata ?? [], [
                        'source_filler_article_id' => $article->id,
                        'source_bucket_id' => $article->bucket_id,
                    ]),
                ]);

                $post->regions()->attach($region->id);

                $article->update([
                    'status' => 'deployed',
                    'deployed_at' => now(),
                    'published_post_id' => $post->id,
                ]);

                $article->bucket->decrement('article_count');
                $article->bucket->update(['last_deployed_at' => now()]);
                $deployed++;
            } catch (Exception $e) {
                Log::error('Filler: Deploy failed', [
                    'article_id' => $article->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $deployed;
    }

    /**
     * Replenish buckets below their minimum threshold using AI generation.
     * Called by weekly scheduled job.
     */
    public function replenishBuckets(): array
    {
        $stats = ['buckets' => 0, 'generated' => 0];

        $lowBuckets = FillerBucket::needsReplenishment()->with('region')->get();

        foreach ($lowBuckets as $bucket) {
            $needed = $bucket->max_capacity - $bucket->article_count;
            try {
                $generated = $this->generateFillerArticles($bucket, $needed);
                $bucket->increment('article_count', $generated);
                $bucket->update(['last_replenished_at' => now()]);
                $stats['buckets']++;
                $stats['generated'] += $generated;
            } catch (Exception $e) {
                Log::error('Filler: Replenish failed', [
                    'bucket_id' => $bucket->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $stats;
    }

    /**
     * Generate evergreen filler articles for a bucket using AI.
     */
    private function generateFillerArticles(FillerBucket $bucket, int $count): int
    {
        $generated = 0;
        $region = $bucket->region;
        $targets = $this->searchTrends->getTopTargetsForRegion($region, 3)
            ->pluck('target_keyword');
        $crossRegion = $this->trendDetection->getTrendingTopicsForContent();
        $topicPriorities = $targets->merge($crossRegion)->unique()->take(5)->implode(', ');

        for ($i = 0; $i < $count; $i++) {
            $prompt = $this->buildFillerPrompt($bucket, $region, $topicPriorities);

            try {
                $parsed = $this->ai->generateJson($prompt, [
                    'type' => 'object',
                    'properties' => [
                        'title' => ['type' => 'string'],
                        'content' => ['type' => 'string'],
                        'excerpt' => ['type' => 'string'],
                        'seo' => [
                            'type' => 'object',
                            'properties' => [
                                'meta_title' => ['type' => 'string'],
                                'meta_description' => ['type' => 'string'],
                                'focus_keyword' => ['type' => 'string'],
                            ],
                        ],
                    ],
                    'required' => ['title', 'content', 'excerpt'],
                ]);

                FillerArticle::create([
                    'bucket_id' => $bucket->id,
                    'region_id' => $region->id,
                    'title' => $parsed['title'] ?? "Business Spotlight: {$bucket->topic}",
                    'content' => $parsed['content'] ?? '',
                    'excerpt' => $parsed['excerpt'] ?? mb_substr(strip_tags($parsed['content'] ?? ''), 0, 300),
                    'seo_metadata' => $parsed['seo'] ?? null,
                    'status' => 'ready',
                    'valid_from' => null,
                    'valid_until' => null,
                ]);

                $generated++;
            } catch (Exception $e) {
                Log::warning('Filler: AI generation failed for bucket', [
                    'bucket_id' => $bucket->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $generated;
    }

    private function buildFillerPrompt(FillerBucket $bucket, Region $region, string $topicPriorities = ''): string
    {
        $priorityHint = $topicPriorities ? "\nSEO priority keywords for this region: {$topicPriorities}" : '';

        return <<<PROMPT
Write an evergreen local business article for {$region->name}.
Topic: {$bucket->topic}
Type: {$bucket->bucket_type}
{$priorityHint}

Requirements:
- Written for a local audience in {$region->name}
- Evergreen content that stays relevant for 30+ days
- SEO-optimized with natural keyword usage
- 400-800 words
- Engaging, informative, community-focused tone
- Use HTML formatting (<p>, <h2>, <strong>, etc.)

Respond with JSON containing: title, content, excerpt, and optionally seo (meta_title, meta_description, focus_keyword).
PROMPT;
    }

    private function ensureUniqueSlug(string $slug): string
    {
        $originalSlug = $slug;
        $counter = 1;

        while (DayNewsPost::where('slug', $slug)->exists()) {
            $slug = $originalSlug.'-'.$counter;
            $counter++;
        }

        return $slug;
    }
}
