<?php

declare(strict_types=1);

namespace App\Http\Controllers\DayNews;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\DayNewsPost;
use App\Services\BusinessService;
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
        private readonly NewsService $newsService,
        private readonly ReviewService $reviewService,
        private readonly OrganizationService $organizationService
    ) {}

    /**
     * Display business directory for Day News
     * Unique positioning: "Local Business News & Community Directory"
     */
    public function index(Request $request): Response
    {
        $currentRegion = $request->attributes->get('detected_region');

        // Use shared BusinessService with DayNews-specific filters
        $filters = [
            'region_id' => $currentRegion?->id,
            'category' => $request->input('category'),
            'status' => 'active',
            'is_verified' => $request->boolean('verified_only') ? true : null,
            'sort_by' => $request->get('sort', 'name'),
            'sort_order' => $request->get('direction', 'asc'),
        ];

        $businesses = $this->businessService->search(
            $request->input('search'),
            $filters,
            20,
            (int) $request->input('page', 1)
        );

        // Get featured businesses with recent news
        $featuredBusinesses = $this->businessService->getFeatured(6);
        $featuredWithNews = $featuredBusinesses->map(function ($business) {
            $recentArticles = DayNewsPost::published()
                ->whereHas('organizationRelationships', function ($q) use ($business) {
                    $q->where('organization_id', $business->id);
                })
                ->orWhereHas('regions', function ($q) use ($business) {
                    $q->whereIn('regions.id', $business->regions->pluck('id'));
                })
                ->orderBy('published_at', 'desc')
                ->limit(3)
                ->get();

            return [
                'business' => $business,
                'recent_articles_count' => $recentArticles->count(),
                'latest_article' => $recentArticles->first(),
            ];
        });

        return Inertia::render('day-news/businesses/index', [
            'businesses' => $businesses,
            'featuredBusinesses' => $featuredWithNews,
            'filters' => $request->only(['search', 'category', 'verified_only']),
            'sort' => ['sort' => $filters['sort_by'], 'direction' => $filters['sort_order']],
            'currentRegion' => $currentRegion,
            'platform' => 'daynews', // For theme differentiation
        ]);
    }

    /**
     * Display a single business with DayNews-specific context
     */
    public function show(Request $request, Business $business): Response
    {
        $business = $this->businessService->find($business->id);
        
        if (!$business) {
            abort(404);
        }

        // Get news articles related to this business
        $relatedArticles = $this->newsService->getPublished([
            'region_id' => $business->regions->first()?->id,
        ], 6)->items();

        // Get articles directly related via organization relationships
        $organizationArticles = DayNewsPost::published()
            ->whereHas('organizationRelationships', function ($q) use ($business) {
                $q->where('organization_id', $business->id)
                  ->where('relatable_type', DayNewsPost::class);
            })
            ->with(['author', 'regions'])
            ->orderBy('published_at', 'desc')
            ->limit(10)
            ->get();

        // Get reviews
        $reviews = $this->reviewService->getForModel($business, ['status' => 'approved'], 10);
        $averageRating = $this->reviewService->getAverageRating($business);

        // Get organization relationships
        $organizationContent = $this->organizationService->getOrganizationContent($business, [
            'App\Models\DayNewsPost',
            'App\Models\Event',
            'App\Models\Coupon',
        ]);

        // Get related businesses (same region, similar category)
        $relatedBusinesses = $this->businessService->getByRegion(
            $business->regions->first(),
            6
        )->filter(fn ($b) => $b->id !== $business->id);

        return Inertia::render('day-news/businesses/show', [
            'business' => $business,
            'relatedArticles' => $organizationArticles->merge($relatedArticles),
            'reviews' => $reviews,
            'averageRating' => $averageRating,
            'organizationContent' => $organizationContent,
            'relatedBusinesses' => $relatedBusinesses,
            'platform' => 'daynews', // For theme differentiation
        ]);
    }
}

