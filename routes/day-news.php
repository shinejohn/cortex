<?php

declare(strict_types=1);

use App\Http\Controllers\Api\AdvertisementController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\DayNews\PostController;
use App\Http\Controllers\DayNews\PostPaymentController;
use App\Http\Controllers\DayNews\PostPublishController;
use App\Http\Controllers\DayNews\PublicPostController;
use App\Http\Controllers\DayNews\SitemapController;
use App\Models\DayNewsPost;
use App\Services\SeoService;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Sitemap routes
Route::get('/robots.txt', [SitemapController::class, 'robots'])->name('day-news.robots');
Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('day-news.sitemap.index');
Route::get('/sitemap-static.xml', [SitemapController::class, 'static'])->name('day-news.sitemap.static');
Route::get('/sitemap-posts.xml', [SitemapController::class, 'posts'])->name('day-news.sitemap.posts');
Route::get('/sitemap-posts-{page}.xml', [SitemapController::class, 'posts'])->where('page', '[0-9]+')->name('day-news.sitemap.posts.page');

// DayNews home page
Route::get('/', function () {
    $currentRegion = request()->attributes->get('detected_region');

    // Get all published posts (both admin and user-submitted)
    $postsQuery = DayNewsPost::published()
        ->with(['author', 'regions', 'workspace'])
        ->orderBy('published_at', 'desc');

    if ($currentRegion) {
        // Only show news for the user's specific region (not parent regions)
        // If there are fewer articles, older ones from this region will fill the list
        $postsQuery->whereHas('regions', function ($q) use ($currentRegion) {
            $q->where('regions.id', $currentRegion->id);
        });
    }

    $allArticles = $postsQuery->limit(20)->get();

    // Get advertisements for different placements
    $adService = app(App\Services\AdvertisementService::class);
    $bannerAds = $adService->getActiveAds('day_news', $currentRegion, 'banner')->take(1);
    $featuredAds = $adService->getActiveAds('day_news', $currentRegion, 'featured')->take(1);
    $inlineAds = $adService->getActiveAds('day_news', $currentRegion, 'inline')->take(3);
    $sidebarAds = $adService->getActiveAds('day_news', $currentRegion, 'sidebar')->take(3);

    // Build SEO JSON-LD for homepage
    $seoData = [
        'title' => 'Your Daily Source for Local Stories',
        'description' => 'Stay informed with the latest local news, stories, and updates from your community. Day News brings you relevant, timely coverage.',
        'url' => '/',
    ];

    return Inertia::render('day-news/index', [
        'seo' => [
            'jsonLd' => SeoService::buildJsonLd('website', $seoData, 'day-news'),
        ],
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

// Location API routes (public, rate-limited)
Route::prefix('api/location')->group(function () {
    // Search endpoint - higher limit for autocomplete
    Route::get('/search', [LocationController::class, 'search'])
        ->middleware('throttle:location-search');

    // Action endpoints - lower limit to prevent abuse
    Route::middleware('throttle:location-actions')->group(function () {
        Route::post('/detect-browser', [LocationController::class, 'detectFromBrowser']);
        Route::post('/set-region', [LocationController::class, 'setRegion']);
        Route::post('/clear', [LocationController::class, 'clear']);
    });
});
