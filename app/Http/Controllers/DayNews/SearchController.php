<?php

declare(strict_types=1);

namespace App\Http\Controllers\DayNews;

use App\Http\Controllers\Controller;
use App\Services\DayNews\SearchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class SearchController extends Controller
{
    public function __construct(
        private readonly SearchService $searchService
    ) {}

    /**
     * Display search results page
     */
    public function index(Request $request): Response
    {
        $query = $request->get('q', '');
        $filter = $request->get('filter', 'all'); // all, articles, events, businesses, tags
        $sortBy = $request->get('sort', 'relevance'); // relevance, date, popularity
        $timeFilter = $request->get('time', 'any'); // any, today, week, month, year

        $results = [
            'articles' => collect(),
            'events' => collect(),
            'businesses' => collect(),
            'tags' => collect(),
        ];

        $totalResults = 0;

        if ($query) {
            // Use SearchService for unified search
            $searchResults = $this->searchService->search($query, [
                'filter' => $filter,
                'sort' => $sortBy,
                'time' => $timeFilter,
            ]);

            // Format results
            $results['articles'] = collect($searchResults['articles'])->map(fn ($post) => [
                'id' => (string) $post->id,
                'type' => 'article',
                'title' => $post->title,
                'excerpt' => $post->excerpt,
                'image' => $post->featured_image,
                'published_at' => $post->published_at?->toISOString(),
                'author' => $post->author ? [
                    'name' => $post->author->name,
                    'avatar' => $post->author->profile_photo_url ?? null,
                ] : null,
                'slug' => $post->slug,
                'regions' => $post->regions->pluck('name')->toArray(),
            ]);

            $results['events'] = collect($searchResults['events'])->map(fn ($event) => [
                'id' => (string) $event->id,
                'type' => 'event',
                'title' => $event->title,
                'description' => $event->description,
                'image' => $event->featured_image,
                'date' => $event->event_date?->toISOString(),
                'venue' => $event->venue?->name,
                'location' => $event->venue?->address,
                'slug' => route('daynews.events.show', $event->id),
            ]);

            $results['businesses'] = collect($searchResults['businesses'])->map(fn ($business) => [
                'id' => (string) $business->id,
                'type' => 'business',
                'title' => $business->name,
                'description' => $business->description,
                'image' => $business->logo_url,
                'address' => $business->address,
                'rating' => $business->rating,
                'review_count' => $business->total_reviews,
                'slug' => $business->slug,
            ]);

            $results['tags'] = collect($searchResults['tags'])->map(fn ($tag) => [
                'id' => $tag->id,
                'type' => 'tag',
                'title' => $tag->name,
                'description' => $tag->description,
                'article_count' => $tag->article_count,
                'followers' => $tag->followers_count,
                'slug' => $tag->slug,
            ]);

            $totalResults = $results['articles']->count() + $results['events']->count() + $results['businesses']->count() + $results['tags']->count();

            // Record search history
            $this->searchService->recordSearch($query, $request->user()?->id, $totalResults, [
                'filter' => $filter,
                'sort' => $sortBy,
                'time' => $timeFilter,
            ]);
        }

        // Get trending searches and suggestions
        $trendingSearches = $this->searchService->getTrendingSearches();
        $suggestions = strlen($query) >= 2 ? $this->searchService->getSuggestions($query, 5) : [];

        return Inertia::render('day-news/search/index', [
            'query' => $query,
            'filter' => $filter,
            'sort' => $sortBy,
            'timeFilter' => $timeFilter,
            'results' => [
                'articles' => $results['articles']->values()->all(),
                'events' => $results['events']->values()->all(),
                'businesses' => $results['businesses']->values()->all(),
                'tags' => $results['tags']->values()->all(),
            ],
            'totalResults' => $totalResults,
            'trendingSearches' => $trendingSearches,
            'suggestions' => $suggestions,
        ]);
    }

    /**
     * Get search suggestions (autocomplete)
     */
    public function suggestions(Request $request): JsonResponse
    {
        $query = $request->get('q', '');
        $suggestions = $this->searchService->getSuggestions($query, 10);

        return response()->json(['suggestions' => $suggestions]);
    }
}

