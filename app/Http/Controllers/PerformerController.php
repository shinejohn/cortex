<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StorePerformerRequest;
use App\Models\Follow;
use App\Models\Performer;
use App\Services\SeoService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class PerformerController extends Controller
{
    public function __construct(
        protected \App\Services\AdvertisementService $advertisementService
    ) {}

    /**
     * Public performers page (no authentication required)
     */
    public function publicIndex(Request $request): Response
    {
        // Get featured performers
        $featuredPerformers = Performer::active()
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
                'count' => Performer::whereJsonContains('genres', 'Rock')->count(),
                'color' => 'purple',
            ],
            [
                'id' => 'solo-artists',
                'name' => 'Solo Artists',
                'icon' => 'mic',
                'count' => Performer::whereJsonContains('genres', 'Singer-Songwriter')->count(),
                'color' => 'blue',
            ],
            [
                'id' => 'djs',
                'name' => 'DJs',
                'icon' => 'headphones',
                'count' => Performer::whereJsonContains('genres', 'Electronic')->count(),
                'color' => 'green',
            ],
            [
                'id' => 'acoustic',
                'name' => 'Acoustic',
                'icon' => 'guitar',
                'count' => Performer::whereJsonContains('genres', 'Acoustic')->count(),
                'color' => 'orange',
            ],
        ];

        // Get current region for ad targeting
        $region = $request->attributes->get('detected_region');

        // Get advertisements
        $bannerAds = $this->advertisementService->getActiveAds('event_city', $region, 'banner')->take(1);
        $sidebarAds = $this->advertisementService->getActiveAds('event_city', $region, 'sidebar')->take(3);

        return Inertia::render('event-city/performers', [
            'featuredPerformers' => $featuredPerformers,
            'performerCategories' => $performerCategories,
            'advertisements' => [
                'banner' => $bannerAds->map(fn ($ad) => $this->formatAd($ad)),
                'sidebar' => $sidebarAds->map(fn ($ad) => $this->formatAd($ad)),
            ],
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

        // Get current region for ad targeting
        $region = $request->attributes->get('detected_region');

        // Get advertisements
        $sidebarAds = $this->advertisementService->getActiveAds('event_city', $region, 'sidebar')->take(3);

        return Inertia::render('event-city/performers/Index', [
            'performers' => $performers,
            'filters' => $request->only(['status', 'verified', 'available', 'genres', 'search', 'rating_min', 'family_friendly']),
            'sort' => ['sort' => $sortBy, 'direction' => $sortDirection],
            'advertisements' => [
                'sidebar' => $sidebarAds->map(fn ($ad) => $this->formatAd($ad)),
            ],
        ]);
    }

    public function show(Request $request, Performer $performer): Response
    {
        $performer->load([
            'workspace',
            'createdBy',
            'upcomingShows' => fn ($q) => $q->orderBy('date', 'asc'),
            'approvedReviews.user',
            'ratings.user',
            'events' => fn ($q) => $q->published()->upcoming()->limit(5),
            'bookings' => fn ($q) => $q->confirmed()->limit(10),
        ]);

        $ratingStats = [
            'average' => (float) ($performer->average_rating ?? 0),
            'total' => $performer->ratings()->count(),
            'distribution' => $performer->getRatingDistribution(),
            'by_context' => [
                'performance' => (float) ($performer->getAverageRatingByContext('performance') ?? 0),
                'professionalism' => (float) ($performer->getAverageRatingByContext('professionalism') ?? 0),
                'value' => (float) ($performer->getAverageRatingByContext('value') ?? 0),
                'overall' => (float) ($performer->getAverageRatingByContext('overall') ?? 0),
            ],
        ];

        // Format upcoming shows for frontend
        $upcomingShows = $performer->upcomingShows->map(fn ($show) => [
            'id' => $show->id,
            'date' => $show->date->toISOString(),
            'venue' => $show->venue,
            'location' => $show->location ?? '',
            'ticketsAvailable' => $show->tickets_available,
            'ticketUrl' => $show->ticket_url,
        ])->toArray();

        // Format reviews for frontend
        $reviews = $performer->approvedReviews->map(fn ($review) => [
            'id' => $review->id,
            'content' => $review->content,
            'rating' => $review->rating,
            'user' => [
                'name' => $review->user->name,
                'avatar' => $review->user->avatar_url ?? null,
            ],
            'created_at' => $review->created_at->toISOString(),
        ])->toArray();

        // Format events for frontend
        $events = $performer->events->map(fn ($event) => [
            'id' => $event->id,
            'title' => $event->title,
            'description' => $event->description,
            'event_date' => $event->event_date,
            'time' => $event->time,
            'image' => $event->image,
            'venue' => [
                'id' => $event->venue->id ?? null,
                'name' => $event->venue->name ?? '',
                'address' => $event->venue->address ?? '',
            ],
        ])->toArray();

        // Prepare performer data for frontend
        $performerData = [
            'id' => $performer->id,
            'name' => $performer->name,
            'profileImage' => $performer->profile_image,
            'genres' => $performer->genres,
            'rating' => (float) $performer->average_rating,
            'reviewCount' => $performer->total_reviews,
            'followerCount' => $performer->follower_count,
            'bio' => $performer->bio,
            'yearsActive' => $performer->years_active,
            'showsPlayed' => $performer->shows_played,
            'homeCity' => $performer->home_city,
            'isVerified' => $performer->is_verified,
            'isTouringNow' => $performer->is_touring_now,
            'availableForBooking' => $performer->available_for_booking,
            'hasMerchandise' => $performer->has_merchandise,
            'hasOriginalMusic' => $performer->has_original_music,
            'offersMeetAndGreet' => $performer->offers_meet_and_greet,
            'takesRequests' => $performer->takes_requests,
            'availableForPrivateEvents' => $performer->available_for_private_events,
            'isFamilyFriendly' => $performer->is_family_friendly,
            'hasSamples' => $performer->has_samples,
            'trendingScore' => $performer->trending_score,
            'upcomingShows' => $upcomingShows,
            'events' => $events,
        ];

        $isFollowing = false;
        if ($request->user()) {
            $isFollowing = Follow::where('user_id', $request->user()->id)
                ->where('followable_type', Performer::class)
                ->where('followable_id', $performer->id)
                ->exists();
        }

        // Build SEO JSON-LD for performer
        $seoData = [
            'title' => "{$performer->name} - Performer Profile",
            'name' => $performer->name,
            'description' => $performer->bio,
            'image' => $performer->profile_image,
            'url' => route('performers.show', $performer->id),
            'genres' => $performer->genres,
            'homeCity' => $performer->home_city,
            'isVerified' => $performer->is_verified,
        ];

        // Get current region for ad targeting
        $region = $request->attributes->get('detected_region');

        // Get advertisements
        $bannerAds = $this->advertisementService->getActiveAds('event_city', $region, 'banner')->take(1);
        $sidebarAds = $this->advertisementService->getActiveAds('event_city', $region, 'sidebar')->take(3);
        $inlineAds = $this->advertisementService->getActiveAds('event_city', $region, 'inline')->take(2);

        return Inertia::render('event-city/performers/show', [
            'seo' => [
                'jsonLd' => SeoService::buildJsonLd('performer', $seoData, 'event-city'),
            ],
            'performer' => $performerData,
            'ratingStats' => $ratingStats,
            'reviews' => $reviews,
            'isFollowing' => $isFollowing,
            'advertisements' => [
                'banner' => $bannerAds->map(fn ($ad) => $this->formatAd($ad)),
                'sidebar' => $sidebarAds->map(fn ($ad) => $this->formatAd($ad)),
                'inline' => $inlineAds->map(fn ($ad) => $this->formatAd($ad)),
            ],
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
        $currentWorkspace = auth()->user()->currentWorkspace;

        if (! $currentWorkspace) {
            abort(403, 'Please select a workspace first.');
        }

        $this->authorize('create', Performer::class);

        return Inertia::render('event-city/performers/create', [
            'workspace' => [
                'can_accept_payments' => $currentWorkspace->canAcceptPayments(),
            ],
        ]);
    }

    public function store(StorePerformerRequest $request)
    {
        $this->authorize('create', Performer::class);

        $currentWorkspace = $request->user()->currentWorkspace;

        if (! $currentWorkspace) {
            abort(403, 'No workspace selected');
        }

        $validated = $request->validated();

        // Handle image uploads
        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('performers', 'public');
                $imagePaths[] = $path;

                // Set first image as profile image
                if ($index === 0 && ! isset($validated['profile_image'])) {
                    $validated['profile_image'] = $path;
                }
            }
        }

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

        return Inertia::render('event-city/performers/Edit', [
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

    /**
     * Display the performer onboarding page.
     */
    public function onboarding(Request $request): Response
    {
        return Inertia::render('event-city/performers/onboarding', [
            'user' => $request->user(),
        ]);
    }

    /**
     * Display the performer management page.
     */
    public function management(Request $request): Response
    {
        $user = $request->user();
        $currentWorkspace = $user->currentWorkspace;

        $performers = Performer::query()
            ->when($currentWorkspace, fn ($q) => $q->where('workspace_id', $currentWorkspace->id))
            ->where('created_by', $user->id)
            ->with('upcomingShows')
            ->latest()
            ->paginate(12);

        return Inertia::render('event-city/performers/management', [
            'performers' => $performers,
        ]);
    }

    /**
     * Format advertisement for frontend
     */
    private function formatAd($ad): array
    {
        return [
            'id' => $ad->id,
            'placement' => $ad->placement,
            'advertable' => [
                'id' => $ad->advertable->id,
                'title' => $ad->advertable->title ?? $ad->advertable->name ?? null,
                'excerpt' => $ad->advertable->excerpt ?? $ad->advertable->description ?? null,
                'featured_image' => $ad->advertable->featured_image ?? $ad->advertable->image ?? $ad->advertable->profile_image ?? null,
                'slug' => $ad->advertable->slug ?? null,
            ],
            'expires_at' => $ad->expires_at->toISOString(),
        ];
    }
}
