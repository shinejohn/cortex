<?php

declare(strict_types=1);

namespace App\Http\Controllers\DowntownGuide;

use App\Http\Controllers\Controller;
use App\Services\SearchService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class SearchController extends Controller
{
    public function __construct(
        private readonly SearchService $searchService
    ) {}

    /**
     * Display search results
     */
    public function index(Request $request): Response
    {
        $query = $request->input('q', '');
        $type = $request->input('type', 'all'); // all, businesses, events, articles, coupons
        $filters = [
            'category' => $request->input('category'),
            'region_id' => $request->input('region_id'),
        ];

        if (empty($query)) {
            return Inertia::render('downtown-guide/search/index', [
                'query' => '',
                'results' => [],
                'filters' => $filters,
                'type' => $type,
                'platform' => 'downtownsguide',
            ]);
        }

        // Use shared SearchService
        $results = $this->searchService->search($query, [
            'type' => $type,
            ...$filters,
        ], 20);

        // Get search suggestions
        $suggestions = $this->searchService->getSuggestions($query, 5);

        return Inertia::render('downtown-guide/search/index', [
            'query' => $query,
            'results' => $results,
            'suggestions' => $suggestions,
            'filters' => $filters,
            'type' => $type,
            'platform' => 'downtownsguide',
        ]);
    }

    /**
     * Get search suggestions (AJAX)
     */
    public function suggestions(Request $request): \Illuminate\Http\JsonResponse
    {
        $query = $request->input('q', '');

        if (empty($query) || strlen($query) < 2) {
            return response()->json(['suggestions' => []]);
        }

        $suggestions = $this->searchService->getSuggestions($query, 10);

        return response()->json(['suggestions' => $suggestions]);
    }
}

