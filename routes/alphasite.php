<?php

declare(strict_types=1);

use App\Http\Controllers\AlphaSite\BusinessPageController;
use App\Http\Controllers\AlphaSite\DirectoryController;
use App\Http\Controllers\AlphaSite\IndustryController;
use App\Http\Controllers\AlphaSite\SearchController;
use App\Http\Controllers\AlphaSite\ClaimController;
use App\Http\Controllers\AlphaSite\CommunityController;
use App\Http\Controllers\AlphaSite\SMBCrmController;
use App\Http\Controllers\AlphaSite\FourCallsSubscriptionController;
use App\Http\Controllers\AlphaSite\FourCallsWebhookController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

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

// Subdomain routing for business pages
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

// Main domain routes
Route::domain('alphasite.com')->group(function () {
    // Home
    Route::get('/', [DirectoryController::class, 'home'])->name('alphasite.home');
    
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
        Route::get('/dashboard', [SMBCrmController::class, 'dashboard'])->name('alphasite.crm.dashboard');
        Route::get('/customers', [SMBCrmController::class, 'customers'])->name('alphasite.crm.customers');
        Route::get('/customers/{customer}', [SMBCrmController::class, 'showCustomer'])->name('alphasite.crm.customer.show');
        Route::get('/interactions', [SMBCrmController::class, 'interactions'])->name('alphasite.crm.interactions');
        Route::get('/faqs', [SMBCrmController::class, 'faqs'])->name('alphasite.crm.faqs');
        Route::post('/faqs', [SMBCrmController::class, 'storeFaq'])->name('alphasite.crm.faqs.store');
        Route::get('/surveys', [SMBCrmController::class, 'surveys'])->name('alphasite.crm.surveys');
        Route::get('/ai-services', [SMBCrmController::class, 'aiServices'])->name('alphasite.crm.ai');
    });
    
    // 4calls.ai Subscription Management Routes
    Route::middleware(['auth', 'verified'])->prefix('api/fourcalls')->group(function () {
        Route::post('/subscribe', [FourCallsSubscriptionController::class, 'subscribe'])->name('alphasite.fourcalls.subscribe');
        Route::post('/change-package', [FourCallsSubscriptionController::class, 'changePackage'])->name('alphasite.fourcalls.change-package');
        Route::post('/cancel', [FourCallsSubscriptionController::class, 'cancel'])->name('alphasite.fourcalls.cancel');
        Route::post('/resume', [FourCallsSubscriptionController::class, 'resume'])->name('alphasite.fourcalls.resume');
        Route::get('/subscription/{businessId}', [FourCallsSubscriptionController::class, 'show'])->name('alphasite.fourcalls.subscription.show');
    });
    
    // CTA
    Route::get('/get-started', [DirectoryController::class, 'getStarted'])->name('alphasite.getstarted');
});

