<?php

declare(strict_types=1);

namespace App\Http\Controllers\AlphaSite;

use App\Http\Controllers\Controller;
use App\Models\AlphaSiteCommunity;
use App\Models\Region;
use App\Services\AdvertisementService;
use App\Services\AlphaSite\CommunityService;
use App\Services\LocationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class CommunityController extends Controller
{
    public function __construct(
        private readonly CommunityService $communityService,
        private readonly AdvertisementService $advertisementService,
        private readonly LocationService $locationService
    ) {}

    /**
     * Show community page
     */
    public function show(string $city, string $state, Request $request): Response
    {
        $community = $this->communityService->getOrCreateCommunity($city, $state);
        
        $businesses = $this->communityService->getCommunityBusinesses(
            $community,
            $request->input('category'),
            24
        );

        $categories = $this->communityService->getCommunityCategories($community);

        // Get region for ad targeting (try to find region from city/state)
        $region = $request->attributes->get('detected_region');

        // Get advertisements
        $bannerAds = $this->advertisementService->getActiveAds('alphasite', $region, 'banner')->take(1);
        $sidebarAds = $this->advertisementService->getActiveAds('alphasite', $region, 'sidebar')->take(3);

        return Inertia::render('alphasite/community/show', [
            'community' => $community,
            'businesses' => $businesses,
            'categories' => $categories,
            'activeCategory' => $request->input('category'),
            'advertisements' => [
                'banner' => $bannerAds->map(fn ($ad) => $this->formatAd($ad)),
                'sidebar' => $sidebarAds->map(fn ($ad) => $this->formatAd($ad)),
            ],
        ]);
    }

    /**
     * Downtown businesses
     */
    public function downtown(string $city, string $state, Request $request): Response
    {
        // Similar to show but filtered for downtown area
        return $this->show($city, $state, $request);
    }

    /**
     * Category filtered community page
     */
    public function category(string $city, string $state, string $category, Request $request): Response
    {
        $request->merge(['category' => $category]);
        return $this->show($city, $state, $request);
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
