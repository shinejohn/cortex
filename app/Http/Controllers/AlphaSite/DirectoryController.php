<?php

declare(strict_types=1);

namespace App\Http\Controllers\AlphaSite;

use App\Http\Controllers\Controller;
use App\Models\Region;
use App\Services\AdvertisementService;
use App\Services\BusinessService;
use App\Services\LocationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class DirectoryController extends Controller
{
    public function __construct(
        private readonly BusinessService $businessService,
        private readonly AdvertisementService $advertisementService,
        private readonly LocationService $locationService
    ) {}

    /**
     * Homepage
     */
    public function home(): Response
    {
        // Get region for ad targeting
        $region = request()->attributes->get('detected_region');

        // Get advertisements
        $bannerAds = $this->advertisementService->getActiveAds('alphasite', $region, 'banner')->take(1);
        $featuredAds = $this->advertisementService->getActiveAds('alphasite', $region, 'featured')->take(1);

        return Inertia::render('alphasite/home', [
            'featuredBusinesses' => $this->businessService->getFeatured(12),
            'advertisements' => [
                'banner' => $bannerAds->map(fn ($ad) => $this->formatAd($ad)),
                'featured' => $featuredAds->map(fn ($ad) => $this->formatAd($ad)),
            ],
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

        // Get region for ad targeting
        $region = $request->attributes->get('detected_region');

        // Get advertisements
        $bannerAds = $this->advertisementService->getActiveAds('alphasite', $region, 'banner')->take(1);
        $sidebarAds = $this->advertisementService->getActiveAds('alphasite', $region, 'sidebar')->take(3);

        return Inertia::render('alphasite/directory/index', [
            'businesses' => $businesses,
            'filters' => $request->only(['search', 'sort', 'direction']),
            'advertisements' => [
                'banner' => $bannerAds->map(fn ($ad) => $this->formatAd($ad)),
                'sidebar' => $sidebarAds->map(fn ($ad) => $this->formatAd($ad)),
            ],
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

        // Get region for ad targeting
        $region = $request->attributes->get('detected_region');

        // Get advertisements
        $bannerAds = $this->advertisementService->getActiveAds('alphasite', $region, 'banner')->take(1);
        $sidebarAds = $this->advertisementService->getActiveAds('alphasite', $region, 'sidebar')->take(3);

        return Inertia::render('alphasite/directory/location', [
            'businesses' => $businesses,
            'city' => $city,
            'state' => $state,
            'filters' => $request->only(['search', 'sort', 'direction']),
            'advertisements' => [
                'banner' => $bannerAds->map(fn ($ad) => $this->formatAd($ad)),
                'sidebar' => $sidebarAds->map(fn ($ad) => $this->formatAd($ad)),
            ],
        ]);
    }

    /**
     * Get started page
     */
    public function getStarted(): Response
    {
        return Inertia::render('alphasite/get-started');
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
