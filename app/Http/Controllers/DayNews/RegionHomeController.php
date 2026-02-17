<?php

declare(strict_types=1);

namespace App\Http\Controllers\DayNews;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Classified;
use App\Models\Coupon;
use App\Models\DayNewsPost;
use App\Models\Event;
use App\Models\LegalNotice;
use App\Models\Region;
use App\Services\AdvertisementService;
use App\Services\LocationService;
use App\Services\SeoService;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

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
        $regionPosts = DayNewsPost::published()
            ->with(['author', 'regions', 'workspace'])
            ->whereHas('regions', fn ($q) => $q->where('regions.id', $region->id))
            ->orderBy('published_at', 'desc')
            ->limit(20)
            ->get();

        // Get national news if requested or by default
        $nationalPosts = DayNewsPost::published()
            ->national()
            ->with(['author', 'regions', 'workspace'])
            ->orderBy('published_at', 'desc')
            ->limit(10)
            ->get();

        // Merge posts (simple merge for now, can be interleaved later)
        // We'll pass them separately to let the frontend handle the toggle/mixing logic
        // But for the main 'news' prop, we can keep it as region posts for valid fallback

        // Get advertisements for different placements
        // Update: getActiveAds now returns mixed types (local + google)
        $bannerAds = $this->advertisementService->getActiveAds('day_news', $region, 'banner')->take(1);
        $featuredAds = $this->advertisementService->getActiveAds('day_news', $region, 'featured')->take(1);
        $inlineAds = $this->advertisementService->getActiveAds('day_news', $region, 'inline')->take(3);
        $sidebarAds = $this->advertisementService->getActiveAds('day_news', $region, 'sidebar')->take(3);

        // Get region-specific content for spec sections
        $announcements = Announcement::published()
            ->forRegion($region->id)
            ->latest('published_at')
            ->limit(5)
            ->get();

        $legalNotices = LegalNotice::query()
            ->whereHas('regions', fn ($q) => $q->where('regions.id', $region->id))
            ->where('status', 'active')
            ->latest('publish_date')
            ->limit(5)
            ->get();

        $classifieds = Classified::active()
            ->inRegion($region->id)
            ->latest('posted_at')
            ->limit(5)
            ->get();

        $coupons = Coupon::active()
            ->inRegion($region->id)
            ->latest('valid_from')
            ->limit(4)
            ->get();

        $events = Event::published()
            ->upcoming()
            ->whereHas('regions', fn ($q) => $q->where('regions.id', $region->id))
            ->with(['venue'])
            ->orderBy('event_date', 'asc')
            ->limit(4)
            ->get();

        // Get latest social posts for Community Voices (safe if table doesn't exist yet)
        try {
            $socialPosts = \App\Models\SocialPost::query()
                ->where('is_active', true)
                ->where('visibility', 'public')
                ->with('user')
                ->latest()
                ->limit(5)
                ->get();
        } catch (Throwable) {
            $socialPosts = collect();
        }

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
            'news' => $regionPosts,
            'nationalNews' => $nationalPosts,
            'announcements' => $announcements,
            'legalNotices' => $legalNotices,
            'classifieds' => $classifieds,
            'coupons' => $coupons,
            'events' => $events,
            'socialPosts' => $socialPosts,
            'hasRegion' => true,
            'advertisements' => [
                'banner' => $bannerAds->map(fn ($ad) => [
                    'id' => $ad->id,
                    'type' => $ad->type,
                    'external_code' => $ad->external_code,
                    'placement' => $ad->placement,
                    'advertable' => $ad->advertable ? [
                        'id' => $ad->advertable->id,
                        'title' => $ad->advertable->title,
                        'excerpt' => $ad->advertable->excerpt,
                        'featured_image' => $ad->advertable->featured_image,
                        'slug' => $ad->advertable->slug,
                    ] : null,
                    'expires_at' => $ad->expires_at->toISOString(),
                ]),
                'featured' => $featuredAds->map(fn ($ad) => [
                    'id' => $ad->id,
                    'type' => $ad->type, // local or google
                    'external_code' => $ad->external_code,
                    'placement' => $ad->placement,
                    'advertable' => $ad->advertable ? [
                        'id' => $ad->advertable->id,
                        'title' => $ad->advertable->title,
                        'excerpt' => $ad->advertable->excerpt,
                        'featured_image' => $ad->advertable->featured_image,
                        'slug' => $ad->advertable->slug,
                    ] : null, // Advertable might be null for google ads
                    'expires_at' => $ad->expires_at->toISOString(),
                ]),
                'inline' => $inlineAds->map(fn ($ad) => [
                    'id' => $ad->id,
                    'type' => $ad->type,
                    'external_code' => $ad->external_code,
                    'placement' => $ad->placement,
                    'advertable' => $ad->advertable ? [
                        'id' => $ad->advertable->id,
                        'title' => $ad->advertable->title,
                        'excerpt' => $ad->advertable->excerpt,
                        'featured_image' => $ad->advertable->featured_image,
                        'slug' => $ad->advertable->slug,
                    ] : null,
                    'expires_at' => $ad->expires_at->toISOString(),
                ]),
                'sidebar' => $sidebarAds->map(fn ($ad) => [
                    'id' => $ad->id,
                    'type' => $ad->type,
                    'external_code' => $ad->external_code,
                    'placement' => $ad->placement,
                    'advertable' => $ad->advertable ? [
                        'id' => $ad->advertable->id,
                        'title' => $ad->advertable->title,
                        'excerpt' => $ad->advertable->excerpt,
                        'featured_image' => $ad->advertable->featured_image,
                        'slug' => $ad->advertable->slug,
                    ] : null,
                    'expires_at' => $ad->expires_at->toISOString(),
                ]),
            ],
        ]);
    }
}
