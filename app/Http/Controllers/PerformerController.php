<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Performer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class PerformerController extends Controller
{
    /**
     * Public performers page (no authentication required)
     */
    public function publicIndex(Request $request): Response
    {
        // Get current workspace
        $currentWorkspace = null;
        if ($request->user()) {
            $user = $request->user();
            $currentWorkspace = $user->currentWorkspace ?? $user->workspaces->first();
        }

        // Get featured performers
        $featuredPerformers = Performer::when($currentWorkspace, function ($query, $workspace) {
            return $query->where('workspace_id', $workspace->id);
        })
            ->active()
            ->verified()
            ->with('upcomingShows')
            ->orderBy('average_rating', 'desc')
            ->take(6)
            ->get()
            ->map(function ($performer) {
                $upcomingShow = $performer->upcomingShows->first();

                return [
                    'id' => $performer->id,
                    'name' => $performer->name,
                    'homeCity' => $performer->home_city,
                    'genres' => is_array($performer->genres) ? $performer->genres : [$performer->genres],
                    'rating' => (string) round((float) ($performer->average_rating ?? 0), 1),
                    'reviewCount' => (string) $performer->total_reviews,
                    'image' => $performer->profile_image ?? 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
                    'upcomingShow' => $upcomingShow ? [
                        'date' => $upcomingShow->date->format('Y-m-d\TH:i:s.000\Z'),
                        'venue' => $upcomingShow->venue,
                    ] : null,
                ];
            })
            ->toArray();

        $performerCategories = [
            [
                'id' => 'bands',
                'name' => 'Bands',
                'icon' => 'music',
                'count' => Performer::when($currentWorkspace, fn ($q, $w) => $q->where('workspace_id', $w->id))
                    ->whereJsonContains('genres', 'Rock')->count(),
                'color' => 'purple',
            ],
            [
                'id' => 'solo-artists',
                'name' => 'Solo Artists',
                'icon' => 'mic',
                'count' => Performer::when($currentWorkspace, fn ($q, $w) => $q->where('workspace_id', $w->id))
                    ->whereJsonContains('genres', 'Singer-Songwriter')->count(),
                'color' => 'blue',
            ],
            [
                'id' => 'djs',
                'name' => 'DJs',
                'icon' => 'headphones',
                'count' => Performer::when($currentWorkspace, fn ($q, $w) => $q->where('workspace_id', $w->id))
                    ->whereJsonContains('genres', 'Electronic')->count(),
                'color' => 'green',
            ],
            [
                'id' => 'acoustic',
                'name' => 'Acoustic',
                'icon' => 'guitar',
                'count' => Performer::when($currentWorkspace, fn ($q, $w) => $q->where('workspace_id', $w->id))
                    ->whereJsonContains('genres', 'Acoustic')->count(),
                'color' => 'orange',
            ],
        ];

        return Inertia::render('performers', [
            'featuredPerformers' => $featuredPerformers,
            'performerCategories' => $performerCategories,
        ]);
    }

    public function index(Request $request): Response
    {
        $currentWorkspace = $request->user()->currentWorkspace;

        if (! $currentWorkspace) {
            abort(403, 'No workspace selected');
        }

        $query = Performer::where('workspace_id', $currentWorkspace->id)
            ->with(['workspace', 'createdBy', 'upcomingShows', 'approvedReviews' => fn ($q) => $q->latest()->limit(3)])
            ->withCount(['reviews as total_reviews', 'ratings as total_ratings']);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('verified')) {
            $query->where('is_verified', $request->boolean('verified'));
        }

        if ($request->filled('available')) {
            $query->where('available_for_booking', $request->boolean('available'));
        }

        if ($request->filled('genres')) {
            $genres = is_array($request->genres) ? $request->genres : [$request->genres];
            foreach ($genres as $genre) {
                $query->whereJsonContains('genres', $genre);
            }
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('bio', 'like', "%{$search}%")
                    ->orWhere('home_city', 'like', "%{$search}%");
            });
        }

        if ($request->filled('rating_min')) {
            $query->where('average_rating', '>=', $request->float('rating_min'));
        }

        if ($request->filled('family_friendly')) {
            $query->where('is_family_friendly', $request->boolean('family_friendly'));
        }

        // Sorting
        $sortBy = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');

        match ($sortBy) {
            'name' => $query->orderBy('name', $sortDirection),
            'rating' => $query->orderBy('average_rating', $sortDirection),
            'experience' => $query->orderBy('years_active', $sortDirection),
            'price' => $query->orderBy('base_price', $sortDirection),
            'trending' => $query->orderBy('trending_score', $sortDirection),
            default => $query->orderBy('created_at', $sortDirection),
        };

        $performers = $query->paginate(12)->withQueryString();

        return Inertia::render('Performers/Index', [
            'performers' => $performers,
            'filters' => $request->only(['status', 'verified', 'available', 'genres', 'search', 'rating_min', 'family_friendly']),
            'sort' => ['sort' => $sortBy, 'direction' => $sortDirection],
        ]);
    }

    public function show(Performer $performer): Response
    {
        $performer->load([
            'workspace',
            'createdBy',
            'upcomingShows',
            'approvedReviews.user',
            'ratings.user',
            'events' => fn ($q) => $q->published()->upcoming()->limit(5),
            'bookings' => fn ($q) => $q->confirmed()->limit(10),
        ]);

        $ratingStats = [
            'average' => $performer->average_rating,
            'total' => $performer->ratings()->count(),
            'distribution' => $performer->getRatingDistribution(),
            'by_context' => [
                'performance' => $performer->getAverageRatingByContext('performance'),
                'professionalism' => $performer->getAverageRatingByContext('professionalism'),
                'value' => $performer->getAverageRatingByContext('value'),
                'overall' => $performer->getAverageRatingByContext('overall'),
            ],
        ];

        return Inertia::render('Performers/Show', [
            'performer' => $performer,
            'ratingStats' => $ratingStats,
        ]);
    }

    public function featured(Request $request): array
    {
        $currentWorkspace = $request->user()->currentWorkspace;

        if (! $currentWorkspace) {
            return [];
        }

        $performers = Performer::where('workspace_id', $currentWorkspace->id)
            ->where('status', 'active')
            ->where('is_verified', true)
            ->where('available_for_booking', true)
            ->highlyRated(4.0)
            ->with('upcomingShows')
            ->orderBy('trending_score', 'desc')
            ->orderBy('average_rating', 'desc')
            ->limit(6)
            ->get()
            ->map(function ($performer) {
                $nextShow = $performer->upcomingShows->first();

                return [
                    'id' => $performer->id,
                    'name' => $performer->name,
                    'image' => $performer->profile_image ?: '/images/performer-placeholder.jpg',
                    'genres' => $performer->genres,
                    'rating' => number_format((float) ($performer->average_rating ?? 0), 1),
                    'reviewCount' => $performer->total_reviews,
                    'homeCity' => $performer->home_city,
                    'yearsActive' => $performer->years_active,
                    'showsPlayed' => $performer->shows_played,
                    'isVerified' => $performer->is_verified,
                    'availableForBooking' => $performer->available_for_booking,
                    'upcomingShow' => $nextShow ? [
                        'date' => $nextShow->date->toISOString(),
                        'venue' => $nextShow->venue,
                        'ticketsAvailable' => $nextShow->tickets_available,
                    ] : null,
                ];
            });

        return $performers->toArray();
    }

    public function trending(Request $request): array
    {
        $currentWorkspace = $request->user()->currentWorkspace;

        if (! $currentWorkspace) {
            return [];
        }

        $performers = Performer::where('workspace_id', $currentWorkspace->id)
            ->where('status', 'active')
            ->where('available_for_booking', true)
            ->trending()
            ->with('upcomingShows')
            ->orderBy('trending_score', 'desc')
            ->limit(8)
            ->get()
            ->map(function ($performer) {
                return [
                    'id' => $performer->id,
                    'name' => $performer->name,
                    'image' => $performer->profile_image ?: '/images/performer-placeholder.jpg',
                    'genres' => $performer->genres,
                    'rating' => number_format((float) ($performer->average_rating ?? 0), 1),
                    'trendingScore' => $performer->trending_score,
                    'homeCity' => $performer->home_city,
                ];
            });

        return $performers->toArray();
    }

    public function create(): Response
    {
        $this->authorize('create', Performer::class);

        return Inertia::render('Performers/Create');
    }

    public function store(Request $request)
    {
        $this->authorize('create', Performer::class);

        $currentWorkspace = $request->user()->currentWorkspace;

        if (! $currentWorkspace) {
            abort(403, 'No workspace selected');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'bio' => 'required|string',
            'genres' => 'required|array|min:1',
            'home_city' => 'required|string',
            'years_active' => 'required|integer|min:0',
            'shows_played' => 'required|integer|min:0',
            'profile_image' => 'nullable|url',
            'base_price' => 'nullable|numeric|min:0',
            'minimum_booking_hours' => 'required|integer|min:1',
            'travel_fee_per_mile' => 'nullable|numeric|min:0',
            'setup_fee' => 'nullable|numeric|min:0',
            'cancellation_policy' => 'nullable|string',
            'available_for_booking' => 'boolean',
            'is_family_friendly' => 'boolean',
            'has_merchandise' => 'boolean',
            'has_original_music' => 'boolean',
            'offers_meet_and_greet' => 'boolean',
            'takes_requests' => 'boolean',
            'available_for_private_events' => 'boolean',
            'has_samples' => 'boolean',
        ]);

        $performer = Performer::create([
            ...$validated,
            'workspace_id' => $currentWorkspace->id,
            'created_by' => $request->user()->id,
            'status' => 'active',
            'follower_count' => 0,
            'trending_score' => 0,
            'added_date' => now(),
            'introductory_pricing' => true,
        ]);

        return redirect()->route('performers.show', $performer)
            ->with('success', 'Performer profile created successfully!');
    }

    public function edit(Performer $performer): Response
    {
        $this->authorize('update', $performer);

        return Inertia::render('Performers/Edit', [
            'performer' => $performer,
        ]);
    }

    public function update(Request $request, Performer $performer)
    {
        $this->authorize('update', $performer);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'bio' => 'required|string',
            'genres' => 'required|array|min:1',
            'home_city' => 'required|string',
            'years_active' => 'required|integer|min:0',
            'shows_played' => 'required|integer|min:0',
            'profile_image' => 'nullable|url',
            'base_price' => 'nullable|numeric|min:0',
            'minimum_booking_hours' => 'required|integer|min:1',
            'travel_fee_per_mile' => 'nullable|numeric|min:0',
            'setup_fee' => 'nullable|numeric|min:0',
            'cancellation_policy' => 'nullable|string',
            'available_for_booking' => 'boolean',
            'is_family_friendly' => 'boolean',
            'has_merchandise' => 'boolean',
            'has_original_music' => 'boolean',
            'offers_meet_and_greet' => 'boolean',
            'takes_requests' => 'boolean',
            'available_for_private_events' => 'boolean',
            'has_samples' => 'boolean',
        ]);

        $performer->update($validated);

        return redirect()->route('performers.show', $performer)
            ->with('success', 'Performer profile updated successfully!');
    }

    public function destroy(Performer $performer)
    {
        $this->authorize('delete', $performer);

        $performer->delete();

        return redirect()->route('performers.index')
            ->with('success', 'Performer profile deleted successfully!');
    }
}
