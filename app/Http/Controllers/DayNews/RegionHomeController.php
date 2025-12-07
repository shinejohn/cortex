<?php

declare(strict_types=1);

namespace App\Http\Controllers\DayNews;

use App\Http\Controllers\Controller;
use App\Models\DayNewsPost;
use App\Models\Region;
use App\Services\AdvertisementService;
use App\Services\LocationService;
use App\Services\SeoService;
use Inertia\Inertia;
use Inertia\Response;

final class RegionHomeController extends Controller
{
    public function __construct(
        private readonly LocationService $locationService,
        private readonly AdvertisementService $advertisementService,
    ) {}

    public function show(string $regionSlug): Response
    {
        $region = Region::active()->where('slug', $regionSlug)->first();

        if ($region === null) {
            abort(404);
        }

        // Store region preference in session/cookie
        $this->locationService->setUserLocation($region->id);

        // Get all published posts for this region
        $allArticles = DayNewsPost::published()
            ->with(['author', 'regions', 'workspace'])
            ->whereHas('regions', fn ($q) => $q->where('regions.id', $region->id))
            ->orderBy('published_at', 'desc')
            ->limit(20)
            ->get();

        // Get advertisements for different placements
        $bannerAds = $this->advertisementService->getActiveAds('day_news', $region, 'banner')->take(1);
        $featuredAds = $this->advertisementService->getActiveAds('day_news', $region, 'featured')->take(1);
        $inlineAds = $this->advertisementService->getActiveAds('day_news', $region, 'inline')->take(3);
        $sidebarAds = $this->advertisementService->getActiveAds('day_news', $region, 'sidebar')->take(3);

        // Build SEO JSON-LD with region-specific data
        $seoData = [
            'title' => "Local News for {$region->name}",
            'description' => "Stay informed with the latest news from {$region->name}. Get timely updates on local stories, events, and community coverage.",
            'url' => "/{$region->slug}",
        ];

        return Inertia::render('day-news/index', [
            'seo' => [
                'jsonLd' => SeoService::buildJsonLd('website', $seoData, 'day-news'),
            ],
            'news' => $allArticles,
            'hasRegion' => true,
            'advertisements' => [
                'banner' => $bannerAds->map(fn ($ad) => [
                    'id' => $ad->id,
                    'placement' => $ad->placement,
                    'advertable' => [
                        'id' => $ad->advertable->id,
                        'title' => $ad->advertable->title,
                        'excerpt' => $ad->advertable->excerpt,
                        'featured_image' => $ad->advertable->featured_image,
                        'slug' => $ad->advertable->slug,
                    ],
                    'expires_at' => $ad->expires_at->toISOString(),
                ]),
                'featured' => $featuredAds->map(fn ($ad) => [
                    'id' => $ad->id,
                    'placement' => $ad->placement,
                    'advertable' => [
                        'id' => $ad->advertable->id,
                        'title' => $ad->advertable->title,
                        'excerpt' => $ad->advertable->excerpt,
                        'featured_image' => $ad->advertable->featured_image,
                        'slug' => $ad->advertable->slug,
                    ],
                    'expires_at' => $ad->expires_at->toISOString(),
                ]),
                'inline' => $inlineAds->map(fn ($ad) => [
                    'id' => $ad->id,
                    'placement' => $ad->placement,
                    'advertable' => [
                        'id' => $ad->advertable->id,
                        'title' => $ad->advertable->title,
                        'excerpt' => $ad->advertable->excerpt,
                        'featured_image' => $ad->advertable->featured_image,
                        'slug' => $ad->advertable->slug,
                    ],
                    'expires_at' => $ad->expires_at->toISOString(),
                ]),
                'sidebar' => $sidebarAds->map(fn ($ad) => [
                    'id' => $ad->id,
                    'placement' => $ad->placement,
                    'advertable' => [
                        'id' => $ad->advertable->id,
                        'title' => $ad->advertable->title,
                        'excerpt' => $ad->advertable->excerpt,
                        'featured_image' => $ad->advertable->featured_image,
                        'slug' => $ad->advertable->slug,
                    ],
                    'expires_at' => $ad->expires_at->toISOString(),
                ]),
            ],
        ]);
    }
}
