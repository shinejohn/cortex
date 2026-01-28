<?php

declare(strict_types=1);

namespace App\Services\News;

use App\Models\Business;
use App\Models\NewsArticle;
use App\Models\Region;
use Exception;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

final class NewsCollectionService
{
    public function __construct(
        private readonly SerpApiService $serpApi
    ) {}

    /**
     * Collect news articles for a region (Phase 2) - Dispatch jobs
     */
    public function collectForRegion(Region $region): int
    {
        if (! config('news-workflow.news_collection.enabled', true)) {
            Log::info('News collection is disabled', ['region' => $region->name]);

            return 0;
        }

        Log::info('Starting news collection (job-based)', [
            'region' => $region->name,
        ]);

        try {
            // Dispatch jobs for business-specific news (parallel)
            $businessJobsCount = $this->dispatchBusinessNewsJobs($region);

            // Fetch category news synchronously (fallback, usually smaller dataset)
            $categoryArticles = $this->fetchCategoryNews($region);

            Log::info('News collection jobs dispatched', [
                'region' => $region->name,
                'business_jobs' => $businessJobsCount,
                'category_articles' => count($categoryArticles),
            ]);

            return $businessJobsCount + count($categoryArticles);
        } catch (Exception $e) {
            Log::error('News collection failed for region', [
                'region' => $region->name,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Dispatch jobs to fetch news for all businesses in the region
     */
    public function dispatchBusinessNewsJobs(Region $region): int
    {
        // Get businesses linked to this region
        $businesses = $region->businesses()
            ->limit(50) // Limit to avoid overwhelming API
            ->get();

        $businessCount = $businesses->count();

        Log::info('Dispatching business news collection jobs', [
            'region' => $region->name,
            'businesses_count' => $businessCount,
        ]);

        if ($businessCount === 0) {
            return 0;
        }

        // Initialize job counter in cache for automatic workflow triggering
        $cacheKey = "news_collection_jobs:{$region->id}";
        Cache::put($cacheKey, $businessCount, now()->addHours(24));

        Log::debug('Initialized job counter', [
            'cache_key' => $cacheKey,
            'job_count' => $businessCount,
        ]);

        $jobsDispatched = 0;

        foreach ($businesses as $business) {
            \App\Jobs\News\ProcessBusinessNewsCollectionJob::dispatch($business, $region);
            $jobsDispatched++;
        }

        return $jobsDispatched;
    }

    /**
     * Fetch news for a single business (called by job)
     */
    public function fetchNewsForBusiness(Business $business, Region $region): array
    {
        $maxArticlesPerBusiness = config('news-workflow.news_collection.max_articles_per_business', 5);
        $storedArticles = [];

        try {
            $newsData = $this->serpApi->fetchNewsForBusiness($business);

            // Limit articles per business
            $newsData = array_slice($newsData, 0, $maxArticlesPerBusiness);

            foreach ($newsData as $articleData) {
                try {
                    $article = $this->storeNewsArticle($articleData, $region);
                    if ($article) {
                        $storedArticles[] = $article;
                    }
                } catch (Exception $e) {
                    Log::warning('Failed to store business news article', [
                        'business' => $business->name,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        } catch (Exception $e) {
            Log::warning('Failed to fetch news for business', [
                'business' => $business->name,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }

        return $storedArticles;
    }

    /**
     * Fetch news for a single category (called by job)
     */
    public function fetchSingleCategoryNews(Region $region, string $category): array
    {
        $maxCategoryArticles = config('news-workflow.news_collection.max_category_articles', 20);
        $storedArticles = [];

        Log::info('Fetching single category news', [
            'region' => $region->name,
            'category' => $category,
        ]);

        try {
            $newsData = $this->serpApi->fetchCategoryNews($region, $category);

            foreach ($newsData as $articleData) {
                try {
                    $article = $this->storeNewsArticle($articleData, $region);
                    if ($article) {
                        $storedArticles[] = $article;
                    }

                    // Stop if we've reached the max
                    if (count($storedArticles) >= $maxCategoryArticles) {
                        break;
                    }
                } catch (Exception $e) {
                    Log::warning('Failed to store category news article', [
                        'category' => $category,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        } catch (Exception $e) {
            Log::warning('Failed to fetch category news', [
                'category' => $category,
                'error' => $e->getMessage(),
            ]);
        }

        return $storedArticles;
    }

    /**
     * Fetch general category news for the region
     *
     * @deprecated Use fetchSingleCategoryNews() with async jobs instead
     */
    public function fetchCategoryNews(Region $region): array
    {
        $maxCategoryArticles = config('news-workflow.news_collection.max_category_articles', 20);
        $categories = config('news-workflow.business_discovery.categories', []);
        $storedArticles = [];

        Log::info('Fetching category news', [
            'region' => $region->name,
            'categories' => $categories,
        ]);

        foreach ($categories as $category) {
            try {
                $newsData = $this->serpApi->fetchCategoryNews($region, $category);

                foreach ($newsData as $articleData) {
                    try {
                        $article = $this->storeNewsArticle($articleData, $region);
                        if ($article) {
                            $storedArticles[] = $article;
                        }

                        // Stop if we've reached the max
                        if (count($storedArticles) >= $maxCategoryArticles) {
                            break 2; // Break both foreach loops
                        }
                    } catch (Exception $e) {
                        Log::warning('Failed to store category news article', [
                            'category' => $category,
                            'error' => $e->getMessage(),
                        ]);
                    }
                }
            } catch (Exception $e) {
                Log::warning('Failed to fetch category news', [
                    'category' => $category,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $storedArticles;
    }

    /**
     * Store news article with deduplication
     */
    public function storeNewsArticle(array $data, Region $region): ?NewsArticle
    {
        // Generate content hash for deduplication
        $contentHash = hash('sha256', ($data['title'] ?? '').'|'.($data['url'] ?? ''));

        // Check if article already exists
        $exists = NewsArticle::where('content_hash', $contentHash)
            ->where('region_id', $region->id)
            ->exists();

        if ($exists) {
            Log::debug('Duplicate article skipped', [
                'title' => $data['title'] ?? 'Unknown',
                'url' => $data['url'] ?? '',
            ]);

            return null;
        }

        // Create new article
        $article = NewsArticle::create([
            'region_id' => $region->id,
            'business_id' => $data['business_id'] ?? null,
            'source_type' => $data['source_type'] ?? 'category',
            'source_name' => $data['source_name'] ?? '',
            'title' => $data['title'] ?? '',
            'url' => $data['url'] ?? '',
            'content_snippet' => $data['content_snippet'] ?? null,
            'source_publisher' => $data['source_publisher'] ?? 'Unknown',
            'published_at' => $data['published_at'] ?? null,
            'metadata' => $data['metadata'] ?? [],
            'content_hash' => $contentHash,
            'processed' => false,
        ]);

        Log::debug('Stored news article', [
            'article_id' => $article->id,
            'title' => $article->title,
            'source_type' => $article->source_type,
        ]);

        return $article;
    }
}
