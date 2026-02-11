<?php

declare(strict_types=1);

namespace App\Http\Controllers\DowntownGuide;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Coupon;
use App\Models\Review;
use App\Services\AdvertisementService;
// For reviews/comments if needed, or Review model
use App\Services\BusinessService;
use App\Services\SeoService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class HomeController extends Controller
{
    public function __construct(
        private readonly BusinessService $businessService,
        private readonly AdvertisementService $advertisementService
    ) {}

    public function index(Request $request): Response
    {
        // 1. Get Featured Businesses (Using Service)
        $featuredBusinesses = $this->businessService->getFeatured(8)->map(function ($business) {
            return [
                'id' => $business->id,
                'name' => $business->name,
                'slug' => $business->slug,
                'category' => $business->category ?? 'Local Business',
                'rating' => $business->rating,
                'review_count' => $business->reviews_count ?? 0,
                'image' => $business->featured_image ?? '/images/business-placeholder.jpg',
                'description' => $business->excerpt,
                'address' => $business->address,
                'city' => $business->city,
                'state' => $business->state,
            ];
        });

        // 2. Get Recent Deals/Coupons
        $recentCoupons = Coupon::with('business')
            ->notExpired()
            ->latest()
            ->take(6)
            ->get()
            ->map(function ($coupon) {
                return [
                    'id' => $coupon->id,
                    'title' => $coupon->title,
                    'discount' => $coupon->discount_value,
                    'type' => $coupon->discount_type,
                    'business' => [
                        'name' => $coupon->business?->name ?? 'Unknown Business',
                        'slug' => $coupon->business?->slug ?? '',
                    ],
                    'expires_at' => $coupon->valid_until?->format('M d, Y'),
                ];
            });

        // 3. Get Advertisements
        $region = $request->attributes->get('detected_region');
        $bannerAds = $this->advertisementService->getActiveAds('downtown_guide', $region, 'banner')->take(1);
        $featuredAds = $this->advertisementService->getActiveAds('downtown_guide', $region, 'featured')->take(3);

        // 4. Get distinct business categories with counts
        $categories = Business::query()
            ->active()
            ->whereNotNull('categories')
            ->get()
            ->flatMap(fn (Business $b) => $b->categories ?? [])
            ->countBy()
            ->sortByDesc(fn (int $count) => $count)
            ->take(8)
            ->map(fn (int $count, string $name) => [
                'slug' => \Illuminate\Support\Str::slug($name),
                'title' => $name,
                'count' => $count,
            ])
            ->values();

        // 5. Get trending businesses (highest rated)
        $trending = Business::query()
            ->active()
            ->orderByDesc('rating')
            ->limit(6)
            ->get()
            ->map(fn (Business $b) => [
                'id' => $b->id,
                'name' => $b->name,
                'slug' => $b->slug,
                'category' => $b->category ?? 'Local Business',
                'rating' => $b->rating,
                'review_count' => $b->reviews_count ?? 0,
                'image' => $b->featured_image ?? '/images/business-placeholder.jpg',
                'city' => $b->city,
                'state' => $b->state,
            ]);

        // 6. Get recent community activity (reviews)
        $communityActivity = Review::query()
            ->approved()
            ->with(['user', 'reviewable'])
            ->where('reviewable_type', Business::class)
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn (Review $r) => [
                'id' => $r->id,
                'rating' => $r->rating,
                'content' => \Illuminate\Support\Str::limit($r->content, 120),
                'created_at' => $r->created_at->diffForHumans(),
                'user' => [
                    'name' => $r->user?->name ?? 'Anonymous',
                    'avatar' => $r->user?->avatar ?? null,
                ],
                'business' => [
                    'name' => $r->reviewable?->name ?? 'Unknown Business',
                    'slug' => $r->reviewable?->slug ?? '',
                ],
            ]);

        // 7. Region info
        $regionName = $region?->name ?? null;
        $hasRegion = $region !== null;

        // 8. SEO
        $seoData = [
            'title' => 'Downtown Guide - Discover Local Gems',
            'description' => 'Explore the best local businesses, events, and exclusive deals in your downtown area.',
            'url' => '/',
        ];

        return Inertia::render('downtown-guide/home', [
            'featuredBusinesses' => $featuredBusinesses,
            'recentCoupons' => $recentCoupons,
            'categories' => $categories,
            'trending' => $trending,
            'communityActivity' => $communityActivity,
            'regionName' => $regionName,
            'hasRegion' => $hasRegion,
            'advertisements' => [
                'banner' => $bannerAds,
                'featured' => $featuredAds,
            ],
            'seo' => [
                'jsonLd' => SeoService::buildJsonLd('website', $seoData, 'downtown-guide'),
            ],
        ]);
    }
}
