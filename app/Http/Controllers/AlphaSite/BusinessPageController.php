<?php

declare(strict_types=1);

namespace App\Http\Controllers\AlphaSite;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Services\BusinessService;
use App\Services\AlphaSite\PageGeneratorService;
use App\Services\AlphaSite\LinkingService;
use App\Services\ReviewService;
use App\Services\CouponService;
use App\Services\EventService;
use App\Services\NewsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class BusinessPageController extends Controller
{
    public function __construct(
        private readonly BusinessService $businessService,
        private readonly PageGeneratorService $pageGeneratorService,
        private readonly LinkingService $linkingService,
        private readonly ReviewService $reviewService,
        private readonly CouponService $couponService,
        private readonly EventService $eventService,
        private readonly NewsService $newsService
    ) {}

    /**
     * Show business page by subdomain
     */
    public function showBySubdomain(string $subdomain): Response
    {
        $business = $this->businessService->getBusinessForAlphaSite($subdomain);
        
        if (!$business) {
            abort(404);
        }

        return $this->renderBusinessPage($business, 'overview');
    }

    /**
     * Show business page by slug
     */
    public function show(string $slug): Response
    {
        $business = $this->businessService->getBusinessForAlphaSite($slug);
        
        if (!$business) {
            abort(404);
        }

        return $this->renderBusinessPage($business, 'overview');
    }

    /**
     * Show specific tab
     */
    public function showTab(string $slug, string $tab): Response
    {
        $business = $this->businessService->getBusinessForAlphaSite($slug);
        
        if (!$business) {
            abort(404);
        }

        return $this->renderBusinessPage($business, $tab);
    }

    /**
     * Render the business page with all data
     */
    private function renderBusinessPage(Business $business, string $activeTab): Response
    {
        // Generate the complete page data
        $pageData = $this->pageGeneratorService->generateBusinessPage($business);
        
        // Get cross-platform content (articles, events, coupons from other platforms)
        $crossPlatformContent = $this->linkingService->getCrossPlatformContent($business);
        
        // Get related businesses
        $relatedBusinesses = $this->businessService->getRelatedBusinesses($business);

        return Inertia::render('alphasite/business/show', [
            'business' => $business,
            'template' => $pageData['template'],
            'seo' => $pageData['seo'],
            'schema' => $pageData['schema'],
            'tabs' => $pageData['tabs'],
            'aiServices' => $pageData['aiServices'],
            'communityLinks' => $pageData['communityLinks'],
            'crossPlatformContent' => $crossPlatformContent,
            'relatedBusinesses' => $relatedBusinesses,
            'activeTab' => $activeTab,
        ]);
    }

    /**
     * Reviews tab
     */
    public function reviews(string $slug): Response
    {
        return $this->showTab($slug, 'reviews');
    }

    /**
     * Photos tab
     */
    public function photos(string $slug): Response
    {
        return $this->showTab($slug, 'photos');
    }

    /**
     * Menu tab (restaurants only)
     */
    public function menu(string $slug): Response
    {
        return $this->showTab($slug, 'menu');
    }

    /**
     * Articles tab - shows Day.News articles about this business
     */
    public function articles(string $slug): Response
    {
        return $this->showTab($slug, 'articles');
    }

    /**
     * Events tab - shows GoEventCity events for this business
     */
    public function events(string $slug): Response
    {
        return $this->showTab($slug, 'events');
    }

    /**
     * Coupons tab
     */
    public function coupons(string $slug): Response
    {
        return $this->showTab($slug, 'coupons');
    }

    /**
     * Achievements tab
     */
    public function achievements(string $slug): Response
    {
        return $this->showTab($slug, 'achievements');
    }

    /**
     * AI Chat endpoint
     */
    public function aiChat(Request $request, string $slug)
    {
        $business = $this->businessService->getBusinessForAlphaSite($slug);
        
        if (!$business) {
            abort(404);
        }

        // TODO: Implement AI chat processing
        return response()->json([
            'response' => 'AI chat functionality coming soon',
            'business_id' => $business->id,
        ]);
    }
}
