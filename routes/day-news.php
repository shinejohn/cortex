<?php

declare(strict_types=1);

use App\Http\Controllers\Api\AdvertisementController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\DayNews\PostController;
use App\Http\Controllers\DayNews\PostPaymentController;
use App\Http\Controllers\DayNews\PostPublishController;
use App\Http\Controllers\DayNews\PublicPostController;
use App\Models\DayNewsPost;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// DayNews home page
Route::get('/', function () {
    $currentRegion = request()->attributes->get('detected_region');

    // Get all published posts (both admin and user-submitted)
    $postsQuery = DayNewsPost::published()
        ->with(['author', 'regions', 'workspace'])
        ->orderBy('published_at', 'desc');

    if ($currentRegion) {
        // Get posts for this region and its parent regions
        $regionIds = [$currentRegion->id];
        if ($currentRegion->parent_id) {
            $regionIds[] = $currentRegion->parent_id;
            // Get grandparent if exists
            $parent = $currentRegion->parent;
            if ($parent && $parent->parent_id) {
                $regionIds[] = $parent->parent_id;
            }
        }

        $postsQuery->whereHas('regions', function ($q) use ($regionIds) {
            $q->whereIn('regions.id', $regionIds);
        });
    }

    $allArticles = $postsQuery->limit(20)->get();

    // Get advertisements for different placements
    $adService = app(App\Services\AdvertisementService::class);
    $bannerAds = $adService->getActiveAds('day_news', $currentRegion, 'banner')->take(1);
    $featuredAds = $adService->getActiveAds('day_news', $currentRegion, 'featured')->take(1);
    $inlineAds = $adService->getActiveAds('day_news', $currentRegion, 'inline')->take(3);
    $sidebarAds = $adService->getActiveAds('day_news', $currentRegion, 'sidebar')->take(3);

    return Inertia::render('day-news/index', [
        'news' => $allArticles,
        'hasRegion' => $currentRegion !== null,
        'advertisements' => [
            'banner' => $bannerAds->map(fn ($ad) => [
                'id' => $ad->id,
                'placement' => $ad->placement,
                'advertable' => [
                    'id' => $ad->advertable->id,
                    'title' => $ad->advertable->title,
                    'excerpt' => $ad->advertable->excerpt,
                    'featured_image' => $ad->advertable->featured_image,
                    'slug' => $ad->advertable->slug,
                ],
                'expires_at' => $ad->expires_at->toISOString(),
            ]),
            'featured' => $featuredAds->map(fn ($ad) => [
                'id' => $ad->id,
                'placement' => $ad->placement,
                'advertable' => [
                    'id' => $ad->advertable->id,
                    'title' => $ad->advertable->title,
                    'excerpt' => $ad->advertable->excerpt,
                    'featured_image' => $ad->advertable->featured_image,
                    'slug' => $ad->advertable->slug,
                ],
                'expires_at' => $ad->expires_at->toISOString(),
            ]),
            'inline' => $inlineAds->map(fn ($ad) => [
                'id' => $ad->id,
                'placement' => $ad->placement,
                'advertable' => [
                    'id' => $ad->advertable->id,
                    'title' => $ad->advertable->title,
                    'excerpt' => $ad->advertable->excerpt,
                    'featured_image' => $ad->advertable->featured_image,
                    'slug' => $ad->advertable->slug,
                ],
                'expires_at' => $ad->expires_at->toISOString(),
            ]),
            'sidebar' => $sidebarAds->map(fn ($ad) => [
                'id' => $ad->id,
                'placement' => $ad->placement,
                'advertable' => [
                    'id' => $ad->advertable->id,
                    'title' => $ad->advertable->title,
                    'excerpt' => $ad->advertable->excerpt,
                    'featured_image' => $ad->advertable->featured_image,
                    'slug' => $ad->advertable->slug,
                ],
                'expires_at' => $ad->expires_at->toISOString(),
            ]),
        ],
    ]);
})->name('day-news.home');

// Authenticated post management routes (must come BEFORE the wildcard {slug} route)
Route::middleware(['auth', 'verified'])->group(function () {
    // Post CRUD routes
    Route::resource('posts', PostController::class)->names([
        'index' => 'day-news.posts.index',
        'create' => 'day-news.posts.create',
        'store' => 'day-news.posts.store',
        'edit' => 'day-news.posts.edit',
        'update' => 'day-news.posts.update',
        'destroy' => 'day-news.posts.destroy',
    ])->except(['show']);

    // Publish workflow routes
    Route::get('/posts/{post}/publish', [PostPublishController::class, 'show'])->name('day-news.posts.publish.show');
    Route::post('/posts/{post}/publish', [PostPublishController::class, 'store'])->name('day-news.posts.publish');

    // Payment callback routes (no CSRF needed)
    Route::get('/payment/success', [PostPaymentController::class, 'success'])
        ->withoutMiddleware([VerifyCsrfToken::class])
        ->name('day-news.posts.payment.success');
    Route::get('/payment/cancel', [PostPaymentController::class, 'cancel'])
        ->name('day-news.posts.payment.cancel');
});

// Public post view (must come AFTER specific routes to avoid matching them)
Route::get('/posts/{slug}', [PublicPostController::class, 'show'])->name('day-news.posts.show');

// Advertisement API routes (public, for fetching ads)
Route::prefix('api/advertisements')->name('api.advertisements.')->group(function () {
    Route::get('/', [AdvertisementController::class, 'index'])->name('index');
    Route::post('/{ad}/impression', [AdvertisementController::class, 'trackImpression'])->name('impression');
    Route::post('/{ad}/click', [AdvertisementController::class, 'trackClick'])->name('click');
});

// Location API routes
Route::prefix('api/location')->name('api.location.')->group(function () {
    Route::post('/detect-browser', [LocationController::class, 'detectFromBrowser'])->name('detect-browser');
    Route::post('/set-region', [LocationController::class, 'setRegion'])->name('set-region');
    Route::get('/search', [LocationController::class, 'search'])->name('search');
    Route::post('/clear', [LocationController::class, 'clear'])->name('clear');
});
