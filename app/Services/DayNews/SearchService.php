<?php

declare(strict_types=1);

namespace App\Services\DayNews;

use App\Models\Business;
use App\Models\DayNewsPost;
use App\Models\Event;
use App\Models\SearchHistory;
use App\Models\SearchSuggestion;
use App\Models\Tag;
use Illuminate\Support\Facades\DB;

final class SearchService
{
    /**
     * Perform unified search across all content types
     */
    public function search(string $query, array $filters = [], int $limit = 20): array
    {
        $results = [
            'articles' => [],
            'events' => [],
            'businesses' => [],
            'tags' => [],
        ];

        $filter = $filters['filter'] ?? 'all';
        $sortBy = $filters['sort'] ?? 'relevance';
        $timeFilter = $filters['time'] ?? 'any';

        // Search articles
        if ($filter === 'all' || $filter === 'articles') {
            $articleQuery = DayNewsPost::published()
                ->where(function ($q) use ($query) {
                    $q->where('title', 'like', "%{$query}%")
                        ->orWhere('content', 'like', "%{$query}%")
                        ->orWhere('excerpt', 'like', "%{$query}%");
                });

            $this->applyTimeFilter($articleQuery, $timeFilter, 'published_at');
            $this->applySorting($articleQuery, $sortBy, [
                'relevance' => 'published_at',
                'date' => 'published_at',
                'popularity' => 'view_count',
            ]);

            $results['articles'] = $articleQuery->limit($limit)->get();
        }

        // Search events
        if ($filter === 'all' || $filter === 'events') {
            $eventQuery = Event::published()
                ->where(function ($q) use ($query) {
                    $q->where('title', 'like', "%{$query}%")
                        ->orWhere('description', 'like', "%{$query}%");
                });

            $this->applySorting($eventQuery, $sortBy, [
                'relevance' => 'event_date',
                'date' => 'event_date',
                'popularity' => 'community_rating',
            ]);

            $results['events'] = $eventQuery->limit($limit)->get();
        }

        // Search businesses
        if ($filter === 'all' || $filter === 'businesses') {
            $businessQuery = Business::active()
                ->where(function ($q) use ($query) {
                    $q->where('name', 'like', "%{$query}%")
                        ->orWhere('description', 'like', "%{$query}%")
                        ->orWhere('address', 'like', "%{$query}%");
                });

            $this->applySorting($businessQuery, $sortBy, [
                'relevance' => 'name',
                'popularity' => 'rating',
            ]);

            $results['businesses'] = $businessQuery->limit($limit)->get();
        }

        // Search tags
        if ($filter === 'all' || $filter === 'tags') {
            $results['tags'] = Tag::where('name', 'like', "%{$query}%")
                ->orWhere('description', 'like', "%{$query}%")
                ->orderBy('article_count', 'desc')
                ->limit($limit)
                ->get();
        }

        return $results;
    }

    /**
     * Get search suggestions
     */
    public function getSuggestions(string $query, int $limit = 10): array
    {
        if (strlen($query) < 2) {
            return [];
        }

        $suggestions = [];

        // Get from search_suggestions table
        $dbSuggestions = SearchSuggestion::where('query', 'like', "{$query}%")
            ->orderBy('popularity', 'desc')
            ->limit($limit)
            ->pluck('query')
            ->toArray();

        $suggestions = array_merge($suggestions, $dbSuggestions);

        // Get tag suggestions
        $tagSuggestions = Tag::where('name', 'like', "{$query}%")
            ->limit(5)
            ->pluck('name')
            ->toArray();

        $suggestions = array_merge($suggestions, $tagSuggestions);

        // Get article title suggestions
        $articleSuggestions = DayNewsPost::published()
            ->where('title', 'like', "{$query}%")
            ->limit(5)
            ->pluck('title')
            ->toArray();

        $suggestions = array_merge($suggestions, $articleSuggestions);

        return array_unique(array_slice($suggestions, 0, $limit));
    }

    /**
     * Get trending searches
     */
    public function getTrendingSearches(int $days = 7, int $limit = 10): array
    {
        return SearchHistory::select('query')
            ->selectRaw('COUNT(*) as count')
            ->where('created_at', '>=', now()->subDays($days))
            ->groupBy('query')
            ->orderBy('count', 'desc')
            ->limit($limit)
            ->pluck('query')
            ->toArray();
    }

    /**
     * Record search history
     */
    public function recordSearch(string $query, ?int $userId = null, int $resultsCount = 0, array $filters = []): void
    {
        SearchHistory::create([
            'user_id' => $userId,
            'query' => $query,
            'results_count' => $resultsCount,
            'filters' => $filters,
            'ip_address' => request()->ip(),
        ]);

        // Update or create search suggestion
        $suggestion = SearchSuggestion::firstOrCreate(['query' => $query]);
        $suggestion->incrementPopularity();
    }

    /**
     * Apply time filter to query
     */
    private function applyTimeFilter($query, string $timeFilter, string $dateColumn): void
    {
        if ($timeFilter === 'any') {
            return;
        }

        match ($timeFilter) {
            'today' => $query->whereDate($dateColumn, today()),
            'week' => $query->where($dateColumn, '>=', now()->subWeek()),
            'month' => $query->where($dateColumn, '>=', now()->subMonth()),
            'year' => $query->where($dateColumn, '>=', now()->subYear()),
            default => null,
        };
    }

    /**
     * Apply sorting to query
     */
    private function applySorting($query, string $sortBy, array $sortMap): void
    {
        $column = $sortMap[$sortBy] ?? $sortMap['relevance'] ?? 'created_at';
        $direction = in_array($sortBy, ['date', 'popularity']) ? ($sortBy === 'date' ? 'desc' : 'desc') : 'desc';

        $query->orderBy($column, $direction);
    }
}

