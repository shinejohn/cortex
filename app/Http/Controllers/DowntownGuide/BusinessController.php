<?php

declare(strict_types=1);

namespace App\Http\Controllers\DowntownGuide;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Services\BusinessService;
use App\Services\CouponService;
use App\Services\EventService;
use App\Services\NewsService;
use App\Services\OrganizationService;
use App\Services\ReviewService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class BusinessController extends Controller
{
    public function __construct(
        private readonly BusinessService $businessService,
        private readonly ReviewService $reviewService,
        private readonly CouponService $couponService,
        private readonly EventService $eventService,
        private readonly NewsService $newsService,
        private readonly OrganizationService $organizationService
    ) {}

    /**
     * Display business directory for DowntownsGuide
     * Unique positioning: "Your Complete Guide to Local Businesses"
     */
    public function index(Request $request): Response
    {
        // Use shared BusinessService with DowntownsGuide-specific filters
        $filters = [
            'category' => $request->input('category'),
            'status' => 'active',
            'is_verified' => $request->boolean('verified_only') ? true : null,
            'featured' => $request->boolean('featured_only') ? true : null,
            'sort_by' => $request->get('sort', 'rating'),
            'sort_order' => $request->get('direction', 'desc'),
        ];

        $businesses = $this->businessService->search(
            $request->input('search'),
            $filters,
            20,
            (int) $request->input('page', 1)
        );

        // Get featured businesses with active deals/coupons
        $featuredBusinesses = $this->businessService->getFeatured(6);
        $featuredWithDeals = $featuredBusinesses->map(function ($business) {
            $activeCoupons = $this->couponService->getCouponsForBusiness($business, true);
            $activeDeals = $activeCoupons->filter(fn ($c) => !in_array($c->discount_type, ['percentage', 'fixed']));

            return [
                'business' => $business,
                'active_deals_count' => $activeDeals->count(),
                'active_coupons_count' => $activeCoupons->count(),
                'latest_deal' => $activeDeals->first() ? [
                    'id' => $activeDeals->first()->id,
                    'title' => $activeDeals->first()->title,
                    'discount_value' => $activeDeals->first()->discount_value,
                ] : null,
            ];
        });

        return Inertia::render('downtown-guide/businesses/index', [
            'businesses' => $businesses,
            'featuredBusinesses' => $featuredWithDeals,
            'filters' => $request->only(['search', 'category', 'verified_only', 'featured_only']),
            'sort' => [
                'sort' => $filters['sort_by'],
                'direction' => $filters['sort_order'],
            ],
            'platform' => 'downtownsguide', // For theme differentiation
        ]);
    }

    /**
     * Display a single business with DowntownsGuide-specific context
     */
    public function show(Request $request, Business $business): Response
    {
        $business = $this->businessService->find($business->id);
        
        if (!$business) {
            abort(404);
        }

        // Get reviews
        $reviews = $this->reviewService->getForModel($business, ['status' => 'approved'], 10);
        $averageRating = $this->reviewService->getAverageRating($business);
        $ratingDistribution = $this->reviewService->getRatingDistribution($business);

        // Get active coupons/deals
        $activeCoupons = $this->couponService->getCouponsForBusiness($business, true);
        $deals = $activeCoupons->filter(fn ($c) => !in_array($c->discount_type, ['percentage', 'fixed']));

        // Get upcoming events at this business
        $upcomingEvents = $this->eventService->getByVenue($business, 5);

        // Get news articles related to this business
        $relatedArticles = $this->newsService->getPublished([
            'region_id' => $business->regions->first()?->id,
        ], 5)->items();

        // Get organization relationships
        $organizationContent = $this->organizationService->getOrganizationContent($business, [
            'App\Models\DayNewsPost',
            'App\Models\Event',
            'App\Models\Coupon',
        ]);

        // Get related businesses (similar category, nearby)
        $relatedBusinesses = $this->businessService->getByCategory(
            $business->categories[0] ?? 'restaurant',
            6
        )->filter(fn ($b) => $b->id !== $business->id);

        return Inertia::render('downtown-guide/businesses/show', [
            'business' => $business,
            'reviews' => $reviews,
            'averageRating' => $averageRating,
            'ratingDistribution' => $ratingDistribution,
            'activeCoupons' => $activeCoupons,
            'deals' => $deals,
            'upcomingEvents' => $upcomingEvents->merge(collect($organizationContent['App\Models\Event'] ?? [])),
            'relatedArticles' => collect($relatedArticles)->merge(collect($organizationContent['App\Models\DayNewsPost'] ?? [])),
            'organizationContent' => $organizationContent,
            'relatedBusinesses' => $relatedBusinesses,
            'platform' => 'downtownsguide', // For theme differentiation
        ]);
    }
}

