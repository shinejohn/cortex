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

// Sitemap routes
Route::get('/robots.txt', [SitemapController::class, 'robots']);
Route::get('/sitemap.xml', [SitemapController::class, 'index']);

Route::name('downtown-guide.')->group(function () {
    // Homepage - Show featured businesses and deals
    // Homepage - Show featured businesses and deals
    Route::get('/', [App\Http\Controllers\DowntownGuide\HomeController::class, 'index'])->name('home');

    // Business directory routes
    Route::get('/businesses', [BusinessController::class, 'index'])->name('businesses.index');
    Route::get('/businesses/{business:slug}', [BusinessController::class, 'show'])->name('businesses.show');

    // Review routes
    Route::get('/businesses/{business:slug}/reviews', [ReviewController::class, 'index'])->name('reviews.index');
    Route::middleware(['auth'])->group(function () {
        Route::get('/businesses/{business:slug}/reviews/create', [ReviewController::class, 'create'])->name('reviews.create');
        Route::post('/businesses/{business:slug}/reviews', [ReviewController::class, 'store'])->name('reviews.store');
        Route::post('/reviews/{review}/helpful', [ReviewController::class, 'helpful'])->name('reviews.helpful');
    });

    // Coupon/Deal routes
    Route::get('/coupons', [CouponController::class, 'index'])->name('coupons.index');
    Route::get('/deals', [CouponController::class, 'index'])->name('deals.index');
    Route::get('/coupons/{coupon:slug}', [CouponController::class, 'show'])->name('coupons.show');
    Route::post('/coupons/{coupon}/apply', [CouponController::class, 'apply'])->name('coupons.apply');

    // Search routes
    Route::get('/search', [SearchController::class, 'index'])->name('search.index');
    Route::get('/search/suggestions', [SearchController::class, 'suggestions'])->name('search.suggestions');

    // Profile routes
    Route::get('/profile', [ProfileController::class, 'me'])->name('profile.me');
    Route::get('/profile/{user:id}', [ProfileController::class, 'show'])->name('profile.show');
    Route::middleware(['auth'])->group(function () {
        Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');
    });

    // Achievement & Gamification routes
    Route::get('/achievements', [AchievementController::class, 'index'])->name('achievements.index');
    Route::get('/leaderboard', [AchievementController::class, 'leaderboard'])->name('leaderboard');
});
