<?php

declare(strict_types=1);

use App\Http\Controllers\DowntownGuide\AchievementController;
use App\Http\Controllers\DowntownGuide\BusinessController;
use App\Http\Controllers\DowntownGuide\CouponController;
use App\Http\Controllers\DowntownGuide\ProfileController;
use App\Http\Controllers\DowntownGuide\ReviewController;
use App\Http\Controllers\DowntownGuide\SearchController;
use App\Http\Controllers\DowntownGuide\SitemapController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Sitemap routes
Route::get('/robots.txt', [SitemapController::class, 'robots']);
Route::get('/sitemap.xml', [SitemapController::class, 'index']);

// Homepage - Show featured businesses and deals
Route::get('/', function () {
    return Inertia::render('downtown-guide/home');
});

// Business directory routes
Route::get('/businesses', [BusinessController::class, 'index']);
Route::get('/businesses/{business:slug}', [BusinessController::class, 'show']);

// Review routes
Route::get('/businesses/{business:slug}/reviews', [ReviewController::class, 'index']);
Route::middleware(['auth'])->group(function () {
    Route::get('/businesses/{business:slug}/reviews/create', [ReviewController::class, 'create']);
    Route::post('/businesses/{business:slug}/reviews', [ReviewController::class, 'store']);
    Route::post('/reviews/{review}/helpful', [ReviewController::class, 'helpful']);
});

// Coupon/Deal routes
Route::get('/coupons', [CouponController::class, 'index']);
Route::get('/deals', [CouponController::class, 'index']);
Route::get('/coupons/{coupon:slug}', [CouponController::class, 'show']);
Route::post('/coupons/{coupon}/apply', [CouponController::class, 'apply']);

// Search routes
Route::get('/search', [SearchController::class, 'index']);
Route::get('/search/suggestions', [SearchController::class, 'suggestions']);

// Profile routes
Route::get('/profile', [ProfileController::class, 'me']);
Route::get('/profile/{user:id}', [ProfileController::class, 'show']);
Route::middleware(['auth'])->group(function () {
    Route::put('/profile', [ProfileController::class, 'update']);
});

// Achievement & Gamification routes
Route::get('/achievements', [AchievementController::class, 'index']);
Route::get('/leaderboard', [AchievementController::class, 'leaderboard']);
