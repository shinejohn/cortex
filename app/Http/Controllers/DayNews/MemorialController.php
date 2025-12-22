<?php

declare(strict_types=1);

namespace App\Http\Controllers\DayNews;

use App\Http\Controllers\Controller;
use App\Models\Memorial;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class MemorialController extends Controller
{
    /**
     * Display memorials listing
     */
    public function index(Request $request): Response
    {
        $currentRegion = $request->attributes->get('detected_region');
        $search = $request->get('search', '');
        $dateFilter = $request->get('date_filter', 'all');

        $query = Memorial::published()
            ->with(['user', 'regions'])
            ->orderBy('date_of_passing', 'desc');

        // Filter by region
        if ($currentRegion) {
            $query->forRegion($currentRegion->id);
        }

        // Date filter
        if ($dateFilter !== 'all') {
            match ($dateFilter) {
                'week' => $query->where('date_of_passing', '>=', now()->subWeek()),
                'month' => $query->where('date_of_passing', '>=', now()->subMonth()),
                'year' => $query->where('date_of_passing', '>=', now()->subYear()),
                default => null,
            };
        }

        // Search
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('obituary', 'like', "%{$search}%");
            });
        }

        $memorials = $query->paginate(20)->withQueryString();

        // Get featured memorial
        $featured = Memorial::published()
            ->featured()
            ->when($currentRegion, function ($q) use ($currentRegion) {
                $q->forRegion($currentRegion->id);
            })
            ->with(['user', 'regions'])
            ->orderBy('date_of_passing', 'desc')
            ->first();

        return Inertia::render('day-news/memorials/index', [
            'memorials' => $memorials,
            'featured' => $featured,
            'filters' => [
                'search' => $search,
                'date_filter' => $dateFilter,
            ],
            'currentRegion' => $currentRegion,
        ]);
    }

    /**
     * Show memorial creation form
     */
    public function create(): Response
    {
        return Inertia::render('day-news/memorials/create');
    }

    /**
     * Store new memorial
     */
    public function store(\App\Http\Requests\DayNews\StoreMemorialRequest $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validated();

        $memorial = Memorial::create([
            'user_id' => $request->user()->id,
            'workspace_id' => $request->user()->currentWorkspace?->id,
            'name' => $validated['name'],
            'years' => $validated['years'],
            'date_of_passing' => $validated['date_of_passing'],
            'obituary' => $validated['obituary'],
            'location' => $validated['location'] ?? null,
            'service_date' => $validated['service_date'] ?? null,
            'service_location' => $validated['service_location'] ?? null,
            'service_details' => $validated['service_details'] ?? null,
            'status' => 'published',
            'published_at' => now(),
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('memorials', 'public');
            $memorial->update(['image' => $path]);
        }

        // Attach regions
        if (!empty($validated['region_ids'])) {
            $memorial->regions()->attach($validated['region_ids']);
        } else {
            $currentRegion = $request->attributes->get('detected_region');
            if ($currentRegion) {
                $memorial->regions()->attach($currentRegion->id);
            }
        }

        return redirect()
            ->route('day-news.memorials.show', $memorial->id)
            ->with('success', 'Memorial published successfully!');
    }

    /**
     * Display single memorial
     */
    public function show(Request $request, Memorial $memorial): Response
    {
        $memorial->load(['user', 'regions']);
        $memorial->incrementViewsCount();

        return Inertia::render('day-news/memorials/show', [
            'memorial' => $memorial,
        ]);
    }
}

