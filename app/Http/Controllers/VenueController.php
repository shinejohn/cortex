<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Venue;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class VenueController extends Controller
{
    /**
     * Public venues page (no authentication required)
     */
    public function publicIndex(Request $request): Response
    {
        // Get current workspace
        $currentWorkspace = null;
        if ($request->user()) {
            $user = $request->user();
            $currentWorkspace = $user->currentWorkspace ?? $user->workspaces->first();
        }

        // Get featured venues
        $featuredVenues = Venue::when($currentWorkspace, function ($query, $workspace) {
            return $query->where('workspace_id', $workspace->id);
        })
            ->active()
            ->verified()
            ->orderBy('average_rating', 'desc')
            ->take(6)
            ->get()
            ->map(function ($venue) {
                return [
                    'id' => $venue->id,
                    'name' => $venue->name,
                    'venueType' => $venue->venue_type,
                    'capacity' => $venue->capacity,
                    'rating' => (string) round((float) ($venue->average_rating ?? 0), 1),
                    'reviewCount' => (string) $venue->total_reviews,
                    'image' => $venue->images[0] ?? 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=400&h=300&fit=crop',
                    'location' => [
                        'address' => $venue->address,
                        'neighborhood' => $venue->neighborhood,
                    ],
                    'pricing' => [
                        'pricePerHour' => $venue->price_per_hour,
                        'pricePerEvent' => $venue->price_per_event,
                        'pricePerDay' => $venue->price_per_day,
                    ],
                ];
            })
            ->toArray();

        $venueCategories = [
            [
                'id' => 'bars',
                'name' => 'Bars & Pubs',
                'icon' => 'beer',
                'count' => Venue::when($currentWorkspace, fn($q, $w) => $q->where('workspace_id', $w->id))
                    ->where('venue_type', 'bar')->count(),
                'color' => 'orange',
            ],
            [
                'id' => 'restaurants',
                'name' => 'Restaurants',
                'icon' => 'utensils',
                'count' => Venue::when($currentWorkspace, fn($q, $w) => $q->where('workspace_id', $w->id))
                    ->where('venue_type', 'restaurant')->count(),
                'color' => 'red',
            ],
            [
                'id' => 'venues',
                'name' => 'Event Venues',
                'icon' => 'building',
                'count' => Venue::when($currentWorkspace, fn($q, $w) => $q->where('workspace_id', $w->id))
                    ->where('venue_type', 'event_space')->count(),
                'color' => 'purple',
            ],
            [
                'id' => 'outdoor',
                'name' => 'Outdoor Spaces',
                'icon' => 'tree',
                'count' => Venue::when($currentWorkspace, fn($q, $w) => $q->where('workspace_id', $w->id))
                    ->where('venue_type', 'outdoor')->count(),
                'color' => 'green',
            ],
        ];

        return Inertia::render('venues', [
            'featuredVenues' => $featuredVenues,
            'venueCategories' => $venueCategories,
        ]);
    }

    public function index(Request $request): Response
    {
        $currentWorkspace = $request->user()->currentWorkspace;

        if (! $currentWorkspace) {
            abort(403, 'No workspace selected');
        }

        $query = Venue::where('workspace_id', $currentWorkspace->id)
            ->with(['workspace', 'createdBy', 'approvedReviews' => fn($q) => $q->latest()->limit(3)])
            ->withCount(['reviews as total_reviews', 'ratings as total_ratings']);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('venue_type')) {
            $query->where('venue_type', $request->venue_type);
        }

        if ($request->filled('verified')) {
            $query->where('verified', $request->boolean('verified'));
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%");
            });
        }

        if ($request->filled('capacity_min')) {
            $query->where('capacity', '>=', $request->integer('capacity_min'));
        }

        if ($request->filled('capacity_max')) {
            $query->where('capacity', '<=', $request->integer('capacity_max'));
        }

        if ($request->filled('rating_min')) {
            $query->where('average_rating', '>=', $request->float('rating_min'));
        }

        // Sorting
        $sortBy = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');

        match ($sortBy) {
            'name' => $query->orderBy('name', $sortDirection),
            'rating' => $query->orderBy('average_rating', $sortDirection),
            'capacity' => $query->orderBy('capacity', $sortDirection),
            'price' => $query->orderBy('price_per_hour', $sortDirection),
            default => $query->orderBy('created_at', $sortDirection),
        };

        $venues = $query->paginate(12)->withQueryString();

        return Inertia::render('Venues/Index', [
            'venues' => $venues,
            'filters' => $request->only(['status', 'venue_type', 'verified', 'search', 'capacity_min', 'capacity_max', 'rating_min']),
            'sort' => ['sort' => $sortBy, 'direction' => $sortDirection],
        ]);
    }

    public function show(Venue $venue): Response
    {
        $venue->load([
            'workspace',
            'createdBy',
            'approvedReviews.user',
            'ratings.user',
            'events' => fn($q) => $q->published()->upcoming()->limit(5),
            'bookings' => fn($q) => $q->confirmed()->limit(10),
        ]);

        $ratingStats = [
            'average' => $venue->average_rating,
            'total' => $venue->ratings()->count(),
            'distribution' => $venue->getRatingDistribution(),
            'by_context' => [
                'service' => $venue->getAverageRatingByContext('service'),
                'quality' => $venue->getAverageRatingByContext('quality'),
                'value' => $venue->getAverageRatingByContext('value'),
                'overall' => $venue->getAverageRatingByContext('overall'),
            ],
        ];

        return Inertia::render('Venues/Show', [
            'venue' => $venue,
            'ratingStats' => $ratingStats,
        ]);
    }

    public function featured(Request $request): array
    {
        $currentWorkspace = $request->user()->currentWorkspace;

        if (! $currentWorkspace) {
            return [];
        }

        $venues = Venue::where('workspace_id', $currentWorkspace->id)
            ->where('status', 'active')
            ->where('verified', true)
            ->highlyRated(4.0)
            ->orderBy('average_rating', 'desc')
            ->orderBy('total_reviews', 'desc')
            ->limit(6)
            ->get()
            ->map(function ($venue) {
                return [
                    'id' => $venue->id,
                    'name' => $venue->name,
                    'venueType' => $venue->venue_type,
                    'capacity' => $venue->capacity,
                    'rating' => number_format((float) ($venue->average_rating ?? 0), 1),
                    'reviewCount' => $venue->total_reviews,
                    'image' => $venue->images[0] ?? '/images/venue-placeholder.jpg',
                    'location' => $venue->address,
                ];
            });

        return $venues->toArray();
    }

    public function create(): Response
    {
        $this->authorize('create', Venue::class);

        return Inertia::render('Venues/Create');
    }

    public function store(Request $request)
    {
        $this->authorize('create', Venue::class);

        $currentWorkspace = $request->user()->currentWorkspace;

        if (! $currentWorkspace) {
            abort(403, 'No workspace selected');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'venue_type' => 'required|string',
            'capacity' => 'required|integer|min:1',
            'price_per_hour' => 'required|numeric|min:0',
            'price_per_event' => 'required|numeric|min:0',
            'price_per_day' => 'required|numeric|min:0',
            'address' => 'required|string',
            'neighborhood' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'amenities' => 'array',
            'event_types' => 'array',
            'images' => 'array',
            'images.*' => 'url',
        ]);

        $venue = Venue::create([
            ...$validated,
            'workspace_id' => $currentWorkspace->id,
            'created_by' => $request->user()->id,
            'status' => 'active',
            'listed_date' => now(),
        ]);

        return redirect()->route('venues.show', $venue)
            ->with('success', 'Venue created successfully!');
    }

    public function edit(Venue $venue): Response
    {
        $this->authorize('update', $venue);

        return Inertia::render('Venues/Edit', [
            'venue' => $venue,
        ]);
    }

    public function update(Request $request, Venue $venue)
    {
        $this->authorize('update', $venue);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'venue_type' => 'required|string',
            'capacity' => 'required|integer|min:1',
            'price_per_hour' => 'required|numeric|min:0',
            'price_per_event' => 'required|numeric|min:0',
            'price_per_day' => 'required|numeric|min:0',
            'address' => 'required|string',
            'neighborhood' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'amenities' => 'array',
            'event_types' => 'array',
            'images' => 'array',
            'images.*' => 'url',
        ]);

        $venue->update($validated);

        return redirect()->route('venues.show', $venue)
            ->with('success', 'Venue updated successfully!');
    }

    public function destroy(Venue $venue)
    {
        $this->authorize('delete', $venue);

        $venue->delete();

        return redirect()->route('venues.index')
            ->with('success', 'Venue deleted successfully!');
    }
}
