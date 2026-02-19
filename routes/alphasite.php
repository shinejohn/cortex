<?php

declare(strict_types=1);

use App\Http\Controllers\AlphaSite\AiPluginController;
use App\Http\Controllers\AlphaSite\BusinessPageController;
use App\Http\Controllers\AlphaSite\CityCategoryPageController;
use App\Http\Controllers\AlphaSite\CityPageController;
use App\Http\Controllers\AlphaSite\ClaimController;
use App\Http\Controllers\AlphaSite\CommandCenterController;
use App\Http\Controllers\AlphaSite\CommunityController;
use App\Http\Controllers\AlphaSite\CountyPageController;
use App\Http\Controllers\AlphaSite\CouponClaimsController;
use App\Http\Controllers\AlphaSite\DirectoryController;
use App\Http\Controllers\AlphaSite\DomainController;
use App\Http\Controllers\AlphaSite\FourCallsSubscriptionController;
use App\Http\Controllers\AlphaSite\IndustryController;
use App\Http\Controllers\AlphaSite\LlmsTxtController;
use App\Http\Controllers\AlphaSite\RevenueProductPurchaseController;
use App\Http\Controllers\AlphaSite\SearchController;
use App\Http\Controllers\AlphaSite\ServiceAreaController;
use App\Http\Controllers\AlphaSite\SitemapController;
use App\Http\Controllers\AlphaSite\SMBCrmController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| AlphaSite Routes
|--------------------------------------------------------------------------
|
| Routes for the AlphaSite business page generation platform.
| Subdomains: {business}.alphasite.com
| Main domain: alphasite.com
|
*/

// Subdomain routing for business pages (.com domain)
Route::domain('{subdomain}.alphasite.com')->group(function () {
    Route::get('/', [BusinessPageController::class, 'showBySubdomain'])->name('alphasite.business.subdomain');
    Route::get('/reviews', [BusinessPageController::class, 'reviews'])->name('alphasite.business.reviews');
    Route::get('/photos', [BusinessPageController::class, 'photos'])->name('alphasite.business.photos');
    Route::get('/menu', [BusinessPageController::class, 'menu'])->name('alphasite.business.menu');
    Route::get('/articles', [BusinessPageController::class, 'articles'])->name('alphasite.business.articles');
    Route::get('/events', [BusinessPageController::class, 'events'])->name('alphasite.business.events');
    Route::get('/coupons', [BusinessPageController::class, 'coupons'])->name('alphasite.business.coupons');
    Route::get('/achievements', [BusinessPageController::class, 'achievements'])->name('alphasite.business.achievements');

    // AI Chat endpoint (for premium businesses)
    Route::post('/ai/chat', [BusinessPageController::class, 'aiChat'])->name('alphasite.business.ai.chat');
});

// Subdomain routing for business pages (.ai domain)
Route::domain('{subdomain}.alphasite.ai')->group(function () {
    Route::get('/', [BusinessPageController::class, 'showBySubdomain'])->name('alphasite.business.subdomain.ai');
    Route::get('/reviews', [BusinessPageController::class, 'reviews'])->name('alphasite.business.reviews.ai');
    Route::get('/photos', [BusinessPageController::class, 'photos'])->name('alphasite.business.photos.ai');
    Route::get('/menu', [BusinessPageController::class, 'menu'])->name('alphasite.business.menu.ai');
    Route::get('/articles', [BusinessPageController::class, 'articles'])->name('alphasite.business.articles.ai');
    Route::get('/events', [BusinessPageController::class, 'events'])->name('alphasite.business.events.ai');
    Route::get('/coupons', [BusinessPageController::class, 'coupons'])->name('alphasite.business.coupons.ai');
    Route::get('/achievements', [BusinessPageController::class, 'achievements'])->name('alphasite.business.achievements.ai');

    // AI Chat endpoint (for premium businesses)
    Route::post('/ai/chat', [BusinessPageController::class, 'aiChat'])->name('alphasite.business.ai.chat.ai');
});

// Main domain routes (.com domain)
// Main domain routes (matches configured domain, e.g. Railway URL or custom domain)
Route::domain(config('domains.alphasite'))->group(function () {
    // Home
    Route::get('/', [DirectoryController::class, 'home'])->name('alphasite.home');

    // AI Discoverability
    Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('alphasite.sitemap');
    Route::get('/sitemap-index.xml', [SitemapController::class, 'sitemapIndex'])->name('alphasite.sitemap.index');
    Route::get('/llms.txt', [LlmsTxtController::class, 'show'])->name('alphasite.llms');
    Route::get('/.well-known/ai-plugin.json', [AiPluginController::class, 'show'])->name('alphasite.ai-plugin');

    // Directory
    Route::get('/directory', [DirectoryController::class, 'index'])->name('alphasite.directory');
    Route::get('/directory/{city}-{state}', [DirectoryController::class, 'byLocation'])->name('alphasite.directory.location');

    // Industries
    Route::get('/industries', [IndustryController::class, 'index'])->name('alphasite.industries');
    Route::get('/industry/{slug}', [IndustryController::class, 'show'])->name('alphasite.industry.show');
    Route::get('/industry/{slug}/{city}-{state}', [IndustryController::class, 'byLocation'])->name('alphasite.industry.location');

    // Business pages (fallback for non-subdomain access)
    Route::get('/business/{slug}', [BusinessPageController::class, 'show'])->name('alphasite.business.show');
    Route::get('/business/{slug}/{tab}', [BusinessPageController::class, 'showTab'])->name('alphasite.business.tab');

    // Community pages
    Route::get('/community/{city}-{state}', [CommunityController::class, 'show'])->name('alphasite.community.show');
    Route::get('/community/{city}-{state}/downtown', [CommunityController::class, 'downtown'])->name('alphasite.community.downtown');
    Route::get('/community/{city}-{state}/{category}', [CommunityController::class, 'category'])->name('alphasite.community.category');

    // Search
    Route::get('/search', [SearchController::class, 'index'])->name('alphasite.search');
    Route::get('/search/suggestions', [SearchController::class, 'suggestions'])->name('alphasite.search.suggestions');

    // Business Claiming
    Route::middleware('auth')->group(function () {
        Route::get('/claim/{slug}', [ClaimController::class, 'start'])->name('alphasite.claim.start');
        Route::post('/claim/{slug}/verify', [ClaimController::class, 'verify'])->name('alphasite.claim.verify');
        Route::post('/claim/{slug}/complete', [ClaimController::class, 'complete'])->name('alphasite.claim.complete');
        Route::post('/claim/{slug}/subscribe', [ClaimController::class, 'subscribe'])->name('alphasite.claim.subscribe');
    });

    // SMB CRM Routes (for claimed businesses)
    Route::middleware(['auth', 'verified'])->prefix('crm')->group(function () {
        Route::get('/command-center', [CommandCenterController::class, 'index'])->name('alphasite.crm.command-center');
        Route::get('/command-center/revenue', [CommandCenterController::class, 'revenue'])->name('alphasite.crm.command-center.revenue');
        Route::get('/command-center/community', [CommandCenterController::class, 'community'])->name('alphasite.crm.command-center.community');
        Route::get('/dashboard', [SMBCrmController::class, 'dashboard'])->name('alphasite.crm.dashboard');
        Route::get('/profile', [SMBCrmController::class, 'profile'])->name('alphasite.crm.profile');
        Route::get('/customers', [SMBCrmController::class, 'customers'])->name('alphasite.crm.customers');
        Route::get('/customers/{customer}', [SMBCrmController::class, 'showCustomer'])->name('alphasite.crm.customer.show');
        Route::get('/interactions', [SMBCrmController::class, 'interactions'])->name('alphasite.crm.interactions');
        Route::get('/faqs', [SMBCrmController::class, 'faqs'])->name('alphasite.crm.faqs');
        Route::post('/faqs', [SMBCrmController::class, 'storeFaq'])->name('alphasite.crm.faqs.store');
        Route::get('/surveys', [SMBCrmController::class, 'surveys'])->name('alphasite.crm.surveys');
        Route::get('/ai-services', [SMBCrmController::class, 'aiServices'])->name('alphasite.crm.ai');
        Route::get('/coupon-claims', [CouponClaimsController::class, 'index'])->name('alphasite.crm.coupon-claims');
        Route::post('/coupon-claims/{claim}/redeem', [CouponClaimsController::class, 'redeem'])->name('alphasite.crm.coupon-claims.redeem');
    });

    // Revenue Product Purchase (Headliner, Section Sponsor, Newsletter Ad)
    Route::middleware(['auth', 'verified'])->prefix('revenue-products')->group(function () {
        Route::post('/checkout', [RevenueProductPurchaseController::class, 'checkout'])->name('alphasite.revenue-product.checkout');
        Route::get('/success', [RevenueProductPurchaseController::class, 'success'])->name('alphasite.revenue-product.success');
        Route::get('/cancel', [RevenueProductPurchaseController::class, 'cancel'])->name('alphasite.revenue-product.cancel');
    });

    // 4calls.ai Subscription Management Routes
    Route::middleware(['auth', 'verified'])->prefix('api/fourcalls')->group(function () {
        Route::post('/subscribe', [FourCallsSubscriptionController::class, 'subscribe'])->name('alphasite.fourcalls.subscribe');
        Route::post('/change-package', [FourCallsSubscriptionController::class, 'changePackage'])->name('alphasite.fourcalls.change-package');
        Route::post('/cancel', [FourCallsSubscriptionController::class, 'cancel'])->name('alphasite.fourcalls.cancel');
        Route::post('/resume', [FourCallsSubscriptionController::class, 'resume'])->name('alphasite.fourcalls.resume');
        Route::get('/subscription/{businessId}', [FourCallsSubscriptionController::class, 'show'])->name('alphasite.fourcalls.subscription.show');
    });

    // Community Linking: City Pages
    Route::get('/city/{slug}', [CityPageController::class, 'show'])->name('alphasite.city.show');
    Route::get('/city/{citySlug}/{categorySlug}', [CityCategoryPageController::class, 'show'])->name('alphasite.city.category');

    // Community Linking: State Pages
    Route::get('/state/{state}', [CityPageController::class, 'showState'])->name('alphasite.state.show');

    // Community Linking: County Pages
    Route::get('/county/{slug}', [CountyPageController::class, 'show'])->name('alphasite.county.show');
    Route::get('/county/{countySlug}/{categorySlug}', [CountyPageController::class, 'showCategory'])->name('alphasite.county.category');

    // Community Sitemaps
    Route::get('/sitemap-cities.xml', [SitemapController::class, 'cities'])->name('alphasite.sitemap.cities');
    Route::get('/sitemap-counties.xml', [SitemapController::class, 'counties'])->name('alphasite.sitemap.counties');
    Route::get('/sitemap-categories.xml', [SitemapController::class, 'categories'])->name('alphasite.sitemap.categories');

    // Service Area Management (authenticated)
    Route::middleware(['auth', 'verified'])->group(function () {
        Route::get('/business/{slug}/service-areas', [ServiceAreaController::class, 'index'])->name('alphasite.service-areas.index');
        Route::post('/business/{slug}/service-areas', [ServiceAreaController::class, 'store'])->name('alphasite.service-areas.store');
        Route::delete('/business/{slug}/service-areas/{id}', [ServiceAreaController::class, 'destroy'])->name('alphasite.service-areas.destroy');
    });

    // Domain Convenience Service (authenticated)
    Route::middleware(['auth', 'verified'])->prefix('business/{slug}/domains')->group(function () {
        Route::get('/', [DomainController::class, 'index'])->name('alphasite.domains.index');
        Route::post('/search', [DomainController::class, 'search'])->name('alphasite.domains.search');
        Route::post('/purchase', [DomainController::class, 'purchase'])->name('alphasite.domains.purchase');
        Route::post('/connect', [DomainController::class, 'connectExternal'])->name('alphasite.domains.connect');
        Route::post('/{domain}/recheck', [DomainController::class, 'recheckDns'])->name('alphasite.domains.recheck');
        Route::post('/{domain}/primary', [DomainController::class, 'setPrimary'])->name('alphasite.domains.primary');
        Route::delete('/{domain}', [DomainController::class, 'destroy'])->name('alphasite.domains.destroy');
        Route::post('/support-chat', [DomainController::class, 'supportChat'])->name('alphasite.domains.support-chat');
    });

    // CTA
    Route::get('/get-started', [DirectoryController::class, 'getStarted'])->name('alphasite.getstarted');
});

// Fallback routes for Railway domain (when custom domain not configured)
// These routes will match when ALPHASITE_DOMAIN matches the Railway domain
// Routes are also accessible via DetectAppDomain middleware detection
Route::middleware('web')->group(function () {
    // Only register these if we're on the Alphasite Railway domain
    // The DetectAppDomain middleware will handle domain detection
    // This allows routes to work on Railway domains like alphasite-production-42b8.up.railway.app

    // Home route (fallback - will be matched by middleware if domain detection works)
    // Note: This is a fallback. Primary routes above use domain constraints.
    // If domain constraints don't match, these routes provide fallback access.
});
