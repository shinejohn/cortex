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
Route::get('/robots.txt', [SitemapController::class, 'robots'])->name('downtown-guide.robots');
Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('downtown-guide.sitemap.index');

// Homepage - Show featured businesses and deals
Route::get('/', function () {
    return Inertia::render('downtown-guide/home');
})->name('downtown-guide.home');

// Business directory routes
Route::get('/businesses', [BusinessController::class, 'index'])->name('downtown-guide.businesses.index');
Route::get('/businesses/{business:slug}', [BusinessController::class, 'show'])->name('downtown-guide.businesses.show');

// Review routes
Route::get('/businesses/{business:slug}/reviews', [ReviewController::class, 'index'])->name('downtown-guide.reviews.index');
Route::middleware(['auth'])->group(function () {
    Route::get('/businesses/{business:slug}/reviews/create', [ReviewController::class, 'create'])->name('downtown-guide.reviews.create');
    Route::post('/businesses/{business:slug}/reviews', [ReviewController::class, 'store'])->name('downtown-guide.reviews.store');
    Route::post('/reviews/{review}/helpful', [ReviewController::class, 'helpful'])->name('downtown-guide.reviews.helpful');
});

// Coupon/Deal routes
Route::get('/coupons', [CouponController::class, 'index'])->name('downtown-guide.coupons.index');
Route::get('/deals', [CouponController::class, 'index'])->name('downtown-guide.deals.index');
Route::get('/coupons/{coupon:slug}', [CouponController::class, 'show'])->name('downtown-guide.coupons.show');
Route::post('/coupons/{coupon}/apply', [CouponController::class, 'apply'])->name('downtown-guide.coupons.apply');

// Search routes
Route::get('/search', [SearchController::class, 'index'])->name('downtown-guide.search.index');
Route::get('/search/suggestions', [SearchController::class, 'suggestions'])->name('downtown-guide.search.suggestions');

// Profile routes
Route::get('/profile', [ProfileController::class, 'me'])->name('downtown-guide.profile.me');
Route::get('/profile/{user:id}', [ProfileController::class, 'show'])->name('downtown-guide.profile.show');
Route::middleware(['auth'])->group(function () {
    Route::put('/profile', [ProfileController::class, 'update'])->name('downtown-guide.profile.update');
});

// Achievement & Gamification routes
Route::get('/achievements', [AchievementController::class, 'index'])->name('downtown-guide.achievements.index');
Route::get('/leaderboard', [AchievementController::class, 'leaderboard'])->name('downtown-guide.leaderboard');
