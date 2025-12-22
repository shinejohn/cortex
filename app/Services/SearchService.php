<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Business;
use App\Models\DayNewsPost;
use App\Models\Event;
use App\Models\Coupon;
use App\Models\Tag;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

final class SearchService
{
    public function __construct(
        private readonly CacheService $cacheService
    ) {}

    /**
     * Unified search across all content types
     */
    public function search(
        string $query,
        array $filters = [],
        int $limit = 20
    ): array {
        $cacheKey = 'search:'.md5(serialize([$query, $filters, $limit]));
        
        return $this->cacheService->remember($cacheKey, now()->addMinutes(5), function () use ($query, $filters, $limit) {
            $results = [
                'articles' => [],
                'events' => [],
                'businesses' => [],
                'coupons' => [],
                'tags' => [],
            ];

            $contentTypes = $filters['types'] ?? ['articles', 'events', 'businesses', 'coupons', 'tags'];
            $perTypeLimit = (int) ceil($limit / count($contentTypes));

            // Search articles
            if (in_array('articles', $contentTypes)) {
                $results['articles'] = $this->searchArticles($query, $filters, $perTypeLimit);
            }

            // Search events
            if (in_array('events', $contentTypes)) {
                $results['events'] = $this->searchEvents($query, $filters, $perTypeLimit);
            }

            // Search businesses
            if (in_array('businesses', $contentTypes)) {
                $results['businesses'] = $this->searchBusinesses($query, $filters, $perTypeLimit);
            }

            // Search coupons
            if (in_array('coupons', $contentTypes)) {
                $results['coupons'] = $this->searchCoupons($query, $filters, $perTypeLimit);
            }

            // Search tags
            if (in_array('tags', $contentTypes)) {
                $results['tags'] = $this->searchTags($query, $filters, $perTypeLimit);
            }

            // Record search
            $this->recordSearch($query, $filters);

            return $results;
        });
    }

    /**
     * Search articles
     */
    private function searchArticles(string $query, array $filters, int $limit): Collection
    {
        $searchQuery = DayNewsPost::published()
            ->where(function ($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                  ->orWhere('content', 'like', "%{$query}%")
                  ->orWhere('excerpt', 'like', "%{$query}%");
            });

        // Apply filters
        if (isset($filters['category'])) {
            $searchQuery->where('category', $filters['category']);
        }

        if (isset($filters['region_id'])) {
            $searchQuery->whereHas('regions', function ($q) use ($filters) {
                $q->where('regions.id', $filters['region_id']);
            });
        }

        if (isset($filters['author_id'])) {
            $searchQuery->where('author_id', $filters['author_id']);
        }

        // Apply time filter
        if (isset($filters['time_period'])) {
            $this->applyTimeFilter($searchQuery, $filters['time_period'], 'published_at');
        }

        // Apply sorting
        $this->applySorting($searchQuery, $filters['sort_by'] ?? 'published_at', $filters['sort_order'] ?? 'desc');

        return $searchQuery->with(['author', 'regions'])
            ->limit($limit)
            ->get();
    }

    /**
     * Search events
     */
    private function searchEvents(string $query, array $filters, int $limit): Collection
    {
        $searchQuery = Event::published()
            ->upcoming()
            ->where(function ($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                  ->orWhere('description', 'like', "%{$query}%");
            });

        // Apply filters
        if (isset($filters['category'])) {
            $searchQuery->where('category', $filters['category']);
        }

        if (isset($filters['region_id'])) {
            $searchQuery->whereHas('regions', function ($q) use ($filters) {
                $q->where('regions.id', $filters['region_id']);
            });
        }

        if (isset($filters['venue_id'])) {
            $searchQuery->where('venue_id', $filters['venue_id']);
        }

        if (isset($filters['performer_id'])) {
            $searchQuery->where('performer_id', $filters['performer_id']);
        }

        if (isset($filters['is_free'])) {
            $searchQuery->where('is_free', $filters['is_free']);
        }

        // Apply time filter
        if (isset($filters['time_period'])) {
            $this->applyTimeFilter($searchQuery, $filters['time_period'], 'event_date');
        }

        // Apply sorting
        $this->applySorting($searchQuery, $filters['sort_by'] ?? 'event_date', $filters['sort_order'] ?? 'asc');

        return $searchQuery->with(['venue', 'performer', 'regions'])
            ->limit($limit)
            ->get();
    }

    /**
     * Search businesses
     */
    private function searchBusinesses(string $query, array $filters, int $limit): Collection
    {
        $searchQuery = Business::active()
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('description', 'like', "%{$query}%")
                  ->orWhere('address', 'like', "%{$query}%")
                  ->orWhere('city', 'like', "%{$query}%");
            });

        // Apply filters
        if (isset($filters['region_id'])) {
            $searchQuery->whereHas('regions', function ($q) use ($filters) {
                $q->where('regions.id', $filters['region_id']);
            });
        }

        if (isset($filters['category'])) {
            $searchQuery->byCategory($filters['category']);
        }

        if (isset($filters['is_verified'])) {
            $searchQuery->where('is_verified', $filters['is_verified']);
        }

        if (isset($filters['is_organization'])) {
            $searchQuery->where('is_organization', $filters['is_organization']);
        }

        // Location filter
        if (isset($filters['latitude'], $filters['longitude'], $filters['radius'])) {
            $searchQuery->withinRadius(
                (float) $filters['latitude'],
                (float) $filters['longitude'],
                (float) $filters['radius']
            );
        }

        // Apply sorting
        $sortBy = $filters['sort_by'] ?? 'name';
        $sortOrder = $filters['sort_order'] ?? 'asc';
        
        if ($sortBy === 'rating') {
            $searchQuery->orderBy('rating', $sortOrder);
        } elseif ($sortBy === 'distance' && isset($filters['latitude'], $filters['longitude'])) {
            $searchQuery->orderBy('distance', $sortOrder);
        } else {
            $searchQuery->orderBy($sortBy, $sortOrder);
        }

        return $searchQuery->with(['regions'])
            ->limit($limit)
            ->get();
    }

    /**
     * Search coupons
     */
    private function searchCoupons(string $query, array $filters, int $limit): Collection
    {
        $searchQuery = Coupon::where('status', 'active')
            ->where(function ($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                  ->orWhere('description', 'like', "%{$query}%")
                  ->orWhere('code', 'like', "%{$query}%");
            })
            ->where(function ($q) {
                $q->whereNull('start_date')
                  ->orWhere('start_date', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('end_date')
                  ->orWhere('end_date', '>=', now());
            });

        // Apply filters
        if (isset($filters['business_id'])) {
            $searchQuery->where('business_id', $filters['business_id']);
        }

        if (isset($filters['region_id'])) {
            $searchQuery->whereHas('regions', function ($q) use ($filters) {
                $q->where('regions.id', $filters['region_id']);
            });
        }

        // Apply sorting
        $this->applySorting($searchQuery, $filters['sort_by'] ?? 'created_at', $filters['sort_order'] ?? 'desc');

        return $searchQuery->with(['business', 'regions'])
            ->limit($limit)
            ->get();
    }

    /**
     * Search tags
     */
    private function searchTags(string $query, array $filters, int $limit): Collection
    {
        $searchQuery = Tag::where('name', 'like', "%{$query}%");

        // Apply sorting
        $this->applySorting($searchQuery, $filters['sort_by'] ?? 'name', $filters['sort_order'] ?? 'asc');

        return $searchQuery->limit($limit)->get();
    }

    /**
     * Get search suggestions
     */
    public function getSuggestions(string $query, int $limit = 10): array
    {
        $cacheKey = 'search:suggestions:'.md5($query).':limit:'.$limit;
        
        return $this->cacheService->remember($cacheKey, now()->addMinutes(10), function () use ($query, $limit) {
            $suggestions = [];

            // Article titles
            $articles = DayNewsPost::published()
                ->where('title', 'like', "%{$query}%")
                ->limit(3)
                ->pluck('title')
                ->toArray();
            $suggestions = array_merge($suggestions, $articles);

            // Event titles
            $events = Event::published()
                ->upcoming()
                ->where('title', 'like', "%{$query}%")
                ->limit(3)
                ->pluck('title')
                ->toArray();
            $suggestions = array_merge($suggestions, $events);

            // Business names
            $businesses = Business::active()
                ->where('name', 'like', "%{$query}%")
                ->limit(3)
                ->pluck('name')
                ->toArray();
            $suggestions = array_merge($suggestions, $businesses);

            // Tags
            $tags = Tag::where('name', 'like', "%{$query}%")
                ->limit(3)
                ->pluck('name')
                ->toArray();
            $suggestions = array_merge($suggestions, $tags);

            return array_unique(array_slice($suggestions, 0, $limit));
        });
    }

    /**
     * Get trending searches
     */
    public function getTrendingSearches(int $limit = 10, string $timePeriod = '24h'): array
    {
        $cacheKey = "search:trending:{$timePeriod}:limit:{$limit}";
        
        return $this->cacheService->remember($cacheKey, now()->addMinutes(5), function () use ($limit, $timePeriod) {
            // This would typically query a search_history table
            // For now, return empty array - implement when search_history table exists
            return [];
        });
    }

    /**
     * Record a search query
     */
    public function recordSearch(string $query, array $filters = []): void
    {
        // This would typically insert into a search_history table
        // For now, just log it
        \Log::info('Search performed', [
            'query' => $query,
            'filters' => $filters,
            'ip' => request()->ip(),
            'user_id' => auth()->id(),
        ]);
    }

    /**
     * Apply time filter to query
     */
    private function applyTimeFilter($query, string $timePeriod, string $dateColumn): void
    {
        match ($timePeriod) {
            'today' => $query->whereDate($dateColumn, today()),
            'week' => $query->whereBetween($dateColumn, [now()->startOfWeek(), now()->endOfWeek()]),
            'month' => $query->whereBetween($dateColumn, [now()->startOfMonth(), now()->endOfMonth()]),
            'year' => $query->whereBetween($dateColumn, [now()->startOfYear(), now()->endOfYear()]),
            default => null,
        };
    }

    /**
     * Apply sorting to query
     */
    private function applySorting($query, string $sortBy, string $sortOrder): void
    {
        $query->orderBy($sortBy, $sortOrder);
    }
}

