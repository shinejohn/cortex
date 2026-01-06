<?php

declare(strict_types=1);

namespace App\Http\Controllers\DayNews;

use App\Http\Controllers\Controller;
use App\Models\CreatorProfile;
use App\Models\Region;
use App\Services\AdvertisementService;
use App\Services\DayNews\PodcastService;
use App\Services\LocationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class CreatorController extends Controller
{
    public function __construct(
        private readonly PodcastService $podcastService,
        private readonly AdvertisementService $advertisementService,
        private readonly LocationService $locationService
    ) {}

    /**
     * Get the view path based on domain/route
     */
    protected function getViewPath(Request $request, string $page): string
    {
        if ($this->isStandaloneView($request)) {
            return "local-voices/{$page}";
        }
        
        return "day-news/local-voices/{$page}";
    }

    /**
     * Get view mode for frontend
     */
    protected function getViewMode(Request $request): string
    {
        return $this->isStandaloneView($request) ? 'standalone' : 'integrated';
    }

    /**
     * Check if this is standalone view (Go Local Voices)
     */
    protected function isStandaloneView(Request $request): bool
    {
        return $request->getHost() === config('domains.local-voices')
            || $request->routeIs('localvoices.*');
    }

    /**
     * Display local voices (podcasts) listing
     */
    public function index(Request $request): Response
    {
        $currentRegion = $request->attributes->get('detected_region');
        $category = $request->get('category', 'all');
        $sort = $request->get('sort', 'trending');
        $search = $request->get('search', '');

        $query = \App\Models\Podcast::published()
            ->with(['creator', 'regions'])
            ->withCount(['episodes' => function ($q) {
                $q->published();
            }]);

        // Filter by region
        if ($currentRegion) {
            $query->forRegion($currentRegion->id);
        }

        // Filter by category
        if ($category !== 'all') {
            $query->byCategory($category);
        }

        // Search
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Sort
        match ($sort) {
            'newest' => $query->orderBy('published_at', 'desc'),
            'popular' => $query->orderBy('subscribers_count', 'desc'),
            default => $query->orderBy('total_listens', 'desc'), // trending
        };

        $podcasts = $query->paginate(20)->withQueryString();

        // Get advertisements (use local_voices platform for standalone, day_news for integrated)
        $platform = $this->isStandaloneView($request) ? 'local_voices' : 'day_news';
        $bannerAds = $this->advertisementService->getActiveAds($platform, $currentRegion, 'banner')->take(1);
        $sidebarAds = $this->advertisementService->getActiveAds($platform, $currentRegion, 'sidebar')->take(3);

        return Inertia::render($this->getViewPath($request, 'index'), [
            'podcasts' => $podcasts,
            'filters' => [
                'category' => $category,
                'sort' => $sort,
                'search' => $search,
            ],
            'currentRegion' => $currentRegion,
            'viewMode' => $this->getViewMode($request),
            'advertisements' => [
                'banner' => $bannerAds->map(fn ($ad) => $this->formatAd($ad)),
                'sidebar' => $sidebarAds->map(fn ($ad) => $this->formatAd($ad)),
            ],
        ]);
    }

    /**
     * Show creator registration form
     */
    public function create(): Response
    {
        $existingProfile = CreatorProfile::where('user_id', auth()->id())->first();

        return Inertia::render($this->getViewPath(request(), 'register'), [
            'existingProfile' => $existingProfile ? [
                'id' => $existingProfile->id,
                'display_name' => $existingProfile->display_name,
                'status' => $existingProfile->status,
            ] : null,
            'viewMode' => $this->getViewMode(request()),
        ]);
    }

    /**
     * Store creator profile
     */
    public function store(\App\Http\Requests\DayNews\StoreCreatorProfileRequest $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validated();

        $profile = $this->podcastService->createCreatorProfile(
            $validated,
            $request->user()->id
        );

        // Handle image uploads
        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('creators/avatars', 'public');
            $profile->update(['avatar' => $path]);
        }

        if ($request->hasFile('cover_image')) {
            $path = $request->file('cover_image')->store('creators/covers', 'public');
            $profile->update(['cover_image' => $path]);
        }

        // Handle social links
        if (!empty($validated['social_links'])) {
            $profile->update(['social_links' => $validated['social_links']]);
        }

        $routeName = $this->isStandaloneView($request) 
            ? 'localvoices.dashboard' 
            : 'daynews.local-voices.dashboard';
            
        return redirect()
            ->route($routeName)
            ->with('success', 'Creator profile submitted for approval!');
    }

    /**
     * Show creator dashboard
     */
    public function dashboard(): Response
    {
        $profile = CreatorProfile::where('user_id', auth()->id())->firstOrFail();
        $podcasts = $profile->podcasts()->with(['episodes' => function ($q) {
            $q->orderBy('created_at', 'desc')->limit(3);
        }])->get();

        return Inertia::render($this->getViewPath(request(), 'dashboard'), [
            'profile' => [
                'id' => $profile->id,
                'display_name' => $profile->display_name,
                'bio' => $profile->bio,
                'avatar' => $profile->avatar,
                'cover_image' => $profile->cover_image,
                'status' => $profile->status,
                'followers_count' => $profile->followers_count,
                'podcasts_count' => $profile->podcasts_count,
                'episodes_count' => $profile->episodes_count,
                'total_listens' => $profile->total_listens,
            ],
            'podcasts' => $podcasts->map(fn ($p) => [
                'id' => $p->id,
                'title' => $p->title,
                'slug' => $p->slug,
                'description' => $p->description,
                'cover_image' => $p->cover_image,
                'status' => $p->status,
                'episodes_count' => $p->episodes_count,
                'subscribers_count' => $p->subscribers_count,
                'total_listens' => $p->total_listens,
                'episodes' => $p->episodes->map(fn ($e) => [
                    'id' => $e->id,
                    'title' => $e->title,
                    'status' => $e->status,
                ]),
            ]),
            'viewMode' => $this->getViewMode(request()),
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
                'featured_image' => $ad->advertable->featured_image ?? $ad->advertable->image ?? $ad->advertable->cover_image ?? null,
                'slug' => $ad->advertable->slug ?? null,
            ],
            'expires_at' => $ad->expires_at->toISOString(),
        ];
    }
}

