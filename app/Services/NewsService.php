<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\DayNewsPost;
use App\Models\User;
use App\Models\Region;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

final class NewsService
{
    public function __construct(
        private readonly CacheService $cacheService
    ) {}

    /**
     * Get published articles
     */
    public function getPublished(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $cacheKey = 'news:published:'.md5(serialize([$filters, $perPage]));
        
        return $this->cacheService->remember($cacheKey, now()->addMinutes(5), function () use ($filters, $perPage) {
            $query = DayNewsPost::published()
                ->with(['author', 'regions', 'tags']);

            // Filters
            if (isset($filters['category'])) {
                $query->where('category', $filters['category']);
            }

            if (isset($filters['type'])) {
                $query->where('type', $filters['type']);
            }

            if (isset($filters['region_id'])) {
                $query->whereHas('regions', function ($q) use ($filters) {
                    $q->where('regions.id', $filters['region_id']);
                });
            }

            if (isset($filters['author_id'])) {
                $query->where('author_id', $filters['author_id']);
            }

            if (isset($filters['tag'])) {
                $query->whereHas('tags', function ($q) use ($filters) {
                    $q->where('tags.slug', $filters['tag']);
                });
            }

            // Sorting
            $sortBy = $filters['sort_by'] ?? 'published_at';
            $sortOrder = $filters['sort_order'] ?? 'desc';
            $query->orderBy($sortBy, $sortOrder);

            return $query->paginate($perPage);
        });
    }

    /**
     * Get articles by category
     */
    public function getByCategory(string $category, int $limit = 20): Collection
    {
        $cacheKey = "news:category:{$category}:limit:{$limit}";
        
        return $this->cacheService->remember($cacheKey, now()->addMinutes(10), function () use ($category, $limit) {
            return DayNewsPost::published()
                ->where('category', $category)
                ->with(['author', 'regions'])
                ->orderBy('published_at', 'desc')
                ->limit($limit)
                ->get();
        });
    }

    /**
     * Get articles by author
     */
    public function getByAuthor(User|string $author, int $perPage = 20): LengthAwarePaginator
    {
        $authorId = $author instanceof User ? $author->id : $author;
        $cacheKey = "news:author:{$authorId}:perPage:{$perPage}";
        
        return $this->cacheService->remember($cacheKey, now()->addMinutes(10), function () use ($authorId, $perPage) {
            return DayNewsPost::published()
                ->where('author_id', $authorId)
                ->with(['regions', 'tags'])
                ->orderBy('published_at', 'desc')
                ->paginate($perPage);
        });
    }

    /**
     * Get related articles
     */
    public function getRelated(DayNewsPost $article, int $limit = 6): Collection
    {
        $cacheKey = "news:related:{$article->id}:limit:{$limit}";
        
        return $this->cacheService->remember($cacheKey, now()->addMinutes(30), function () use ($article, $limit) {
            $query = DayNewsPost::published()
                ->where('id', '!=', $article->id)
                ->with(['author', 'regions']);

            // Find articles with same category
            if ($article->category) {
                $query->where('category', $article->category);
            }

            // Find articles with same tags
            if ($article->tags->isNotEmpty()) {
                $tagIds = $article->tags->pluck('id');
                $query->whereHas('tags', function ($q) use ($tagIds) {
                    $q->whereIn('tags.id', $tagIds);
                });
            }

            // Find articles in same regions
            if ($article->regions->isNotEmpty()) {
                $regionIds = $article->regions->pluck('id');
                $query->whereHas('regions', function ($q) use ($regionIds) {
                    $q->whereIn('regions.id', $regionIds);
                });
            }

            return $query->orderBy('published_at', 'desc')
                ->limit($limit)
                ->get();
        });
    }

    /**
     * Get trending articles
     */
    public function getTrending(int $limit = 10, string $timePeriod = '7d'): Collection
    {
        $cacheKey = "news:trending:{$timePeriod}:limit:{$limit}";
        
        return $this->cacheService->remember($cacheKey, now()->addMinutes(5), function () use ($limit, $timePeriod) {
            $query = DayNewsPost::published()
                ->with(['author', 'regions']);

            // Time period filter
            match ($timePeriod) {
                '24h' => $query->where('published_at', '>=', now()->subDay()),
                '7d' => $query->where('published_at', '>=', now()->subWeek()),
                '30d' => $query->where('published_at', '>=', now()->subMonth()),
                default => null,
            };

            // Order by view count and recency
            return $query->orderBy('view_count', 'desc')
                ->orderBy('published_at', 'desc')
                ->limit($limit)
                ->get();
        });
    }

    /**
     * Get featured articles
     */
    public function getFeatured(int $limit = 6): Collection
    {
        $cacheKey = "news:featured:limit:{$limit}";
        
        return $this->cacheService->remember($cacheKey, now()->addMinutes(30), function () use ($limit) {
            return DayNewsPost::published()
                ->whereNotNull('featured_image')
                ->with(['author', 'regions'])
                ->orderBy('published_at', 'desc')
                ->limit($limit)
                ->get();
        });
    }

    /**
     * Get articles by region
     */
    public function getByRegion(Region|string $region, int $limit = 20): Collection
    {
        $regionId = $region instanceof Region ? $region->id : $region;
        $cacheKey = "news:region:{$regionId}:limit:{$limit}";
        
        return $this->cacheService->remember($cacheKey, now()->addMinutes(10), function () use ($regionId, $limit) {
            return DayNewsPost::published()
                ->whereHas('regions', function ($q) use ($regionId) {
                    $q->where('regions.id', $regionId);
                })
                ->with(['author', 'tags'])
                ->orderBy('published_at', 'desc')
                ->limit($limit)
                ->get();
        });
    }

    /**
     * Increment view count
     */
    public function incrementViewCount(DayNewsPost $article): void
    {
        $article->increment('view_count');
        $this->cacheService->forget("news:trending:*");
    }

    /**
     * Clear news-related cache
     */
    public function clearCache(?DayNewsPost $article = null): void
    {
        $this->cacheService->forget('news:*');
        
        if ($article) {
            $this->cacheService->forget("news:related:{$article->id}:*");
            
            if ($article->category) {
                $this->cacheService->forget("news:category:{$article->category}:*");
            }
            
            if ($article->author_id) {
                $this->cacheService->forget("news:author:{$article->author_id}:*");
            }
            
            foreach ($article->regions as $region) {
                $this->cacheService->forget("news:region:{$region->id}:*");
            }
        }
    }
}

