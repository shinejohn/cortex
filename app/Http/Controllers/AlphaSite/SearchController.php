<?php

declare(strict_types=1);

namespace App\Http\Controllers\AlphaSite;

use App\Http\Controllers\Controller;
use App\Services\BusinessService;
use App\Services\SearchService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class SearchController extends Controller
{
    public function __construct(
        private readonly BusinessService $businessService,
        private readonly SearchService $searchService
    ) {}

    /**
     * Search results page
     */
    public function index(Request $request): Response
    {
        $query = $request->input('q', '');
        
        $results = $this->searchService->search($query, [
            'types' => ['business'],
            'limit' => 24,
        ]);

        return Inertia::render('alphasite/search/index', [
            'query' => $query,
            'results' => $results,
        ]);
    }

    /**
     * Search suggestions (autocomplete)
     */
    public function suggestions(Request $request)
    {
        $query = $request->input('q', '');
        
        if (strlen($query) < 2) {
            return response()->json([]);
        }

        $suggestions = $this->searchService->getSuggestions($query, 10);

        return response()->json($suggestions);
    }
}
