<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreVenueRequest;
use App\Models\Follow;
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
        // Build the venues query
        $query = Venue::active()
            ->with(['reviews' => fn ($q) => $q->approved()->latest()->limit(3)]);

        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('venue_type', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%")
                    ->orWhere('neighborhood', 'like', "%{$search}%");
            });
        }

        // Apply venue type filter
        if ($request->filled('venue_types') && is_array($request->venue_types)) {
            $query->whereIn('venue_type', $request->venue_types);
        }

        // Apply capacity filter
        if ($request->filled('min_capacity')) {
            $query->where('capacity', '>=', $request->integer('min_capacity'));
        }
        if ($request->filled('max_capacity')) {
            $query->where('capacity', '<=', $request->integer('max_capacity'));
        }

        // Apply price filter
        if ($request->filled('min_price')) {
            $query->where('price_per_hour', '>=', $request->float('min_price'));
        }
        if ($request->filled('max_price')) {
            $query->where('price_per_hour', '<=', $request->float('max_price'));
        }

        // Apply amenities filter
        if ($request->filled('amenities') && is_array($request->amenities)) {
            $amenities = $request->amenities;
            $query->where(function ($q) use ($amenities) {
                foreach ($amenities as $amenity) {
                    $q->whereJsonContains('amenities', $amenity);
                }
            });
        }

        // Apply verified filter
        if ($request->filled('verified')) {
            $query->where('verified', $request->boolean('verified'));
        }

        // Apply date availability filter
        if ($request->filled('date')) {
            $date = $request->date;
            $query->where(function ($q) use ($date) {
                $q->whereNull('unavailable_dates')
                    ->orWhere(function ($q) use ($date) {
                        $q->whereNotNull('unavailable_dates')
                            ->whereRaw('NOT JSON_CONTAINS(unavailable_dates, ?)', [json_encode($date)]);
                    });
            });
        }

        // Apply sorting
        $sortBy = $request->get('sort', 'popular');
        match ($sortBy) {
            'popular' => $query->orderByRaw('(total_reviews * 0.3 + average_rating * 0.7) DESC'),
            'recommended' => $query->orderByRaw('(average_rating * 0.7 + total_reviews * 0.3) DESC'),
            'newest' => $query->orderBy('listed_date', 'desc'),
            'price_low' => $query->orderBy('price_per_hour', 'asc'),
            'price_high' => $query->orderBy('price_per_hour', 'desc'),
            'distance' => $query->orderBy('id'), // Placeholder for distance sorting
            'rating' => $query->orderBy('average_rating', 'desc'),
            'capacity' => $query->orderBy('capacity', 'desc'),
            default => $query->orderByRaw('(total_reviews * 0.3 + average_rating * 0.7) DESC'),
        };

        // Get paginated venues
        $venues = $query->paginate(12)->withQueryString();

        // Transform venues for frontend
        $venues->getCollection()->transform(function ($venue) {
            return [
                'id' => $venue->id,
                'name' => $venue->name,
                'description' => $venue->description,
                'venueType' => $venue->venue_type,
                'capacity' => $venue->capacity,
                'rating' => round((float) ($venue->average_rating ?? 0), 1),
                'reviewCount' => $venue->total_reviews ?? 0,
                'images' => $venue->images ?? [],
                'verified' => $venue->verified,
                'location' => [
                    'address' => $venue->address,
                    'neighborhood' => $venue->neighborhood,
                    'coordinates' => [
                        'lat' => $venue->latitude,
                        'lng' => $venue->longitude,
                    ],
                ],
                'amenities' => $venue->amenities ?? [],
                'eventTypes' => $venue->event_types ?? [],
                'pricing' => [
                    'pricePerHour' => $venue->price_per_hour,
                    'pricePerEvent' => $venue->price_per_event,
                    'pricePerDay' => $venue->price_per_day,
                ],
                'availability' => [
                    'unavailableDates' => $venue->unavailable_dates ?? [],
                    'responseTimeHours' => $venue->response_time_hours,
                ],
                'lastBookedDaysAgo' => $venue->last_booked_days_ago,
                'listedDate' => $venue->listed_date?->toISOString(),
                'distance' => 0, // Placeholder - would be calculated based on user location
            ];
        });

        // Get trending venues (most popular recently)
        $trendingVenues = Venue::active()
            ->where('last_booked_days_ago', '<=', 30)
            ->orderByRaw('(total_reviews / GREATEST(last_booked_days_ago, 1)) DESC')
            ->limit(4)
            ->get()
            ->map(function ($venue) {
                return [
                    'id' => $venue->id,
                    'name' => $venue->name,
                    'venueType' => $venue->venue_type,
                    'images' => $venue->images ?? [],
                    'location' => [
                        'neighborhood' => $venue->neighborhood,
                    ],
                    'rating' => round((float) ($venue->average_rating ?? 0), 1),
                    'reviewCount' => $venue->total_reviews ?? 0,
                ];
            });

        // Get new venues (added in the last 90 days)
        $newVenues = Venue::active()
            ->where('listed_date', '>=', now()->subDays(90))
            ->orderBy('listed_date', 'desc')
            ->limit(4)
            ->get()
            ->map(function ($venue) {
                return [
                    'id' => $venue->id,
                    'name' => $venue->name,
                    'venueType' => $venue->venue_type,
                    'images' => $venue->images ?? [],
                    'location' => [
                        'neighborhood' => $venue->neighborhood,
                    ],
                    'listedDate' => $venue->listed_date?->toISOString(),
                ];
            });

        // Get venue statistics
        $totalVenues = Venue::active()->count();
        $newVenuesThisWeek = Venue::active()
            ->where('listed_date', '>=', now()->subWeek())
            ->count();

        // Get upcoming events at venues (mock data for now)
        $upcomingEvents = [];

        return Inertia::render('venues', [
            'venues' => $venues,
            'trendingVenues' => $trendingVenues,
            'newVenues' => $newVenues,
            'upcomingEvents' => $upcomingEvents,
            'stats' => [
                'totalVenues' => $totalVenues,
                'eventsThisWeek' => 427, // Mock data
                'newVenuesThisWeek' => $newVenuesThisWeek,
            ],
            'filters' => $request->only(['search', 'venue_types', 'min_capacity', 'max_capacity', 'min_price', 'max_price', 'amenities', 'verified', 'date']),
            'sort' => $sortBy,
        ]);
    }

    public function index(Request $request): Response
    {
        $currentWorkspace = $request->user()->currentWorkspace;

        if (! $currentWorkspace) {
            abort(403, 'No workspace selected');
        }

        $query = Venue::where('workspace_id', $currentWorkspace->id)
            ->with(['workspace', 'createdBy', 'approvedReviews' => fn ($q) => $q->latest()->limit(3)])
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

    public function show(Request $request, Venue $venue): Response
    {
        $venue->load([
            'workspace',
            'createdBy',
            'approvedReviews.user',
            'ratings.user',
            'events' => fn ($q) => $q->published()->upcoming()->limit(5),
            'bookings' => fn ($q) => $q->confirmed()->limit(10),
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

        $isFollowing = false;
        if ($request->user()) {
            $isFollowing = Follow::where('user_id', $request->user()->id)
                ->where('followable_type', Venue::class)
                ->where('followable_id', $venue->id)
                ->exists();
        }

        return Inertia::render('venues/show', [
            'venue' => $venue,
            'ratingStats' => $ratingStats,
            'isFollowing' => $isFollowing,
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
        $currentWorkspace = auth()->user()->currentWorkspace;

        if (! $currentWorkspace) {
            abort(403, 'Please select a workspace first.');
        }

        $this->authorize('create', Venue::class);

        return Inertia::render('venues/create');
    }

    public function store(StoreVenueRequest $request)
    {
        $this->authorize('create', Venue::class);

        $currentWorkspace = $request->user()->currentWorkspace;

        if (! $currentWorkspace) {
            abort(403, 'No workspace selected');
        }

        $validated = $request->validated();

        // Handle image uploads
        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('venues', 'public');
                $imagePaths[] = $path;
            }
        }

        $venue = Venue::create([
            ...$validated,
            'images' => $imagePaths,
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

        return Inertia::render('venues/edit', [
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

        return redirect()->route('venues')
            ->with('success', 'Venue deleted successfully!');
    }
}
