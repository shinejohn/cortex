<?php

declare(strict_types=1);

namespace App\Http\Controllers\AlphaSite;

use App\Http\Controllers\Controller;
use App\Services\BusinessService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class DirectoryController extends Controller
{
    public function __construct(
        private readonly BusinessService $businessService
    ) {}

    /**
     * Homepage
     */
    public function home(): Response
    {
        return Inertia::render('alphasite/home', [
            'featuredBusinesses' => $this->businessService->getFeatured(12),
        ]);
    }

    /**
     * Directory index
     */
    public function index(Request $request): Response
    {
        $businesses = $this->businessService->search(
            $request->input('search'),
            [
                'status' => 'active',
                'sort_by' => $request->get('sort', 'name'),
                'sort_order' => $request->get('direction', 'asc'),
            ],
            24,
            (int) $request->input('page', 1)
        );

        return Inertia::render('alphasite/directory/index', [
            'businesses' => $businesses,
            'filters' => $request->only(['search', 'sort', 'direction']),
        ]);
    }

    /**
     * Directory by location
     */
    public function byLocation(string $city, string $state, Request $request): Response
    {
        $businesses = $this->businessService->search(
            $request->input('search'),
            [
                'status' => 'active',
                'city' => $city,
                'state' => $state,
                'sort_by' => $request->get('sort', 'name'),
                'sort_order' => $request->get('direction', 'asc'),
            ],
            24,
            (int) $request->input('page', 1)
        );

        return Inertia::render('alphasite/directory/location', [
            'businesses' => $businesses,
            'city' => $city,
            'state' => $state,
            'filters' => $request->only(['search', 'sort', 'direction']),
        ]);
    }

    /**
     * Get started page
     */
    public function getStarted(): Response
    {
        return Inertia::render('alphasite/get-started');
    }
}
