<?php

declare(strict_types=1);

use App\Http\Controllers\Api\AdvertisementController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\DayNews\PostController;
use App\Http\Controllers\DayNews\PostPaymentController;
use App\Http\Controllers\DayNews\PostPublishController;
use App\Http\Controllers\DayNews\PublicPostController;
use App\Http\Controllers\DayNews\RegionHomeController;
use App\Http\Controllers\DayNews\SitemapController;
use App\Models\DayNewsPost;
use App\Services\SeoService;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Sitemap routes
Route::get('/robots.txt', [SitemapController::class, 'robots']);
Route::get('/sitemap.xml', [SitemapController::class, 'index']);
Route::get('/sitemap-static.xml', [SitemapController::class, 'static']);
Route::get('/sitemap-posts.xml', [SitemapController::class, 'posts']);
Route::get('/sitemap-posts-{page}.xml', [SitemapController::class, 'posts'])->where('page', '[0-9]+');
Route::get('/sitemap-regions.xml', [SitemapController::class, 'regions']);

// Public Content Standards Policy
Route::get('/content-policy', [App\Http\Controllers\ContentPolicyController::class, 'show'])
    ->name('content-policy');

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

    // Fetch additional data for the homepage
    $announcements = App\Models\Announcement::query()
        ->when($currentRegion, fn ($q) => $q->whereHas('regions', fn ($r) => $r->where('regions.id', $currentRegion->id)))
        ->latest()
        ->take(5)
        ->get();

    $classifieds = App\Models\Classified::query()
        ->when($currentRegion, fn ($q) => $q->whereHas('regions', fn ($r) => $r->where('regions.id', $currentRegion->id)))
        ->latest()
        ->take(5)
        ->get();

    $coupons = App\Models\Coupon::query()
        ->when($currentRegion, fn ($q) => $q->whereHas('regions', fn ($r) => $r->where('regions.id', $currentRegion->id)))
        ->latest()
        ->take(5)
        ->get();

    $events = App\Models\Event::query()
        ->when($currentRegion, fn ($q) => $q->whereHas('regions', fn ($r) => $r->where('regions.id', $currentRegion->id)))
        ->where('event_date', '>=', now())
        ->orderBy('event_date')
        ->take(5)
        ->get();

    $legalNotices = App\Models\LegalNotice::query()
        ->when($currentRegion, fn ($q) => $q->whereHas('regions', fn ($r) => $r->where('regions.id', $currentRegion->id)))
        ->latest('publish_date')
        ->take(5)
        ->get();

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
        'announcements' => $announcements,
        'classifieds' => $classifieds,
        'coupons' => $coupons,
        'events' => $events,
        'legalNotices' => $legalNotices,
        'advertisements' => [
            'banner' => $bannerAds->filter(fn ($ad) => $ad->advertable !== null)->map(fn ($ad) => [
                'id' => $ad->id,
                'placement' => $ad->placement,
                'advertable' => [
                    'id' => $ad->advertable->id,
                    'title' => $ad->advertable->title,
                    'excerpt' => $ad->advertable->excerpt,
                    'featured_image' => $ad->advertable->featured_image,
                    'slug' => $ad->advertable->slug,
                ],
                'expires_at' => $ad->expires_at?->toISOString(),
            ])->values(),
            'featured' => $featuredAds->filter(fn ($ad) => $ad->advertable !== null)->map(fn ($ad) => [
                'id' => $ad->id,
                'placement' => $ad->placement,
                'advertable' => [
                    'id' => $ad->advertable->id,
                    'title' => $ad->advertable->title,
                    'excerpt' => $ad->advertable->excerpt,
                    'featured_image' => $ad->advertable->featured_image,
                    'slug' => $ad->advertable->slug,
                ],
                'expires_at' => $ad->expires_at?->toISOString(),
            ])->values(),
            'inline' => $inlineAds->filter(fn ($ad) => $ad->advertable !== null)->map(fn ($ad) => [
                'id' => $ad->id,
                'placement' => $ad->placement,
                'advertable' => [
                    'id' => $ad->advertable->id,
                    'title' => $ad->advertable->title,
                    'excerpt' => $ad->advertable->excerpt,
                    'featured_image' => $ad->advertable->featured_image,
                    'slug' => $ad->advertable->slug,
                ],
                'expires_at' => $ad->expires_at?->toISOString(),
            ])->values(),
            'sidebar' => $sidebarAds->filter(fn ($ad) => $ad->advertable !== null)->map(fn ($ad) => [
                'id' => $ad->id,
                'placement' => $ad->placement,
                'advertable' => [
                    'id' => $ad->advertable->id,
                    'title' => $ad->advertable->title,
                    'excerpt' => $ad->advertable->excerpt,
                    'featured_image' => $ad->advertable->featured_image,
                    'slug' => $ad->advertable->slug,
                ],
                'expires_at' => $ad->expires_at?->toISOString(),
            ])->values(),
        ],
    ]);
})->name('home');

// Admin Moderation Dashboard (admin only)
Route::middleware(['auth', 'verified', 'can:access-admin'])->prefix('admin/moderation')->name('admin.moderation.')->group(function () {
    Route::get('/', [App\Http\Controllers\Admin\ModerationDashboardController::class, 'index'])->name('index');
    Route::get('/content/{contentType}/{contentId}', [App\Http\Controllers\Admin\ModerationDashboardController::class, 'show'])->name('show');
    Route::post('/content/{contentType}/{contentId}/override', [App\Http\Controllers\Admin\ModerationDashboardController::class, 'override'])->name('override');
    Route::get('/complaints', [App\Http\Controllers\Admin\ModerationDashboardController::class, 'complaints'])->name('complaints');
    Route::get('/interventions', [App\Http\Controllers\Admin\ModerationDashboardController::class, 'interventions'])->name('interventions');
    Route::get('/analytics', [App\Http\Controllers\Admin\ModerationDashboardController::class, 'analytics'])->name('analytics');
});

// Authenticated post management routes (must come BEFORE the wildcard {slug} route)
Route::middleware(['auth', 'verified'])->group(function () {
    // Post CRUD routes (AI-assisted create is integrated into posts.create)
    Route::resource('posts', PostController::class)->names([
        'index' => 'posts.index',
        'create' => 'posts.create',
        'store' => 'posts.store',
        'edit' => 'posts.edit',
        'update' => 'posts.update',
        'destroy' => 'posts.destroy',
    ])->except(['show']);

    // Publish workflow routes
    Route::get('/posts/{post}/publish', [PostPublishController::class, 'show'])->name('posts.publish.show');
    Route::post('/posts/{post}/publish', [PostPublishController::class, 'store'])->name('posts.publish');

    // Payment callback routes (no CSRF needed)
    Route::get('/payment/success', [PostPaymentController::class, 'success'])
        ->withoutMiddleware([VerifyCsrfToken::class])
        ->name('posts.payment.success');
    Route::get('/payment/cancel', [PostPaymentController::class, 'cancel'])
        ->name('posts.payment.cancel');
});

// Public post view (must come AFTER specific routes to avoid matching them)
Route::get('/posts/{slug}', [PublicPostController::class, 'show'])->name('posts.show');

// Article comments routes
Route::get('/posts/{post}/comments', [App\Http\Controllers\DayNews\ArticleCommentController::class, 'index'])->name('posts.comments.index');

Route::middleware(['auth'])->group(function () {
    Route::post('/posts/{post}/comments', [App\Http\Controllers\DayNews\ArticleCommentController::class, 'store'])->name('posts.comments.store');
    Route::patch('/comments/{comment}', [App\Http\Controllers\DayNews\ArticleCommentController::class, 'update'])->name('comments.update');
    Route::delete('/comments/{comment}', [App\Http\Controllers\DayNews\ArticleCommentController::class, 'destroy'])->name('comments.destroy');
    Route::post('/comments/{comment}/like', [App\Http\Controllers\DayNews\ArticleCommentController::class, 'toggleLike'])->name('comments.like');
    Route::post('/comments/{comment}/report', [App\Http\Controllers\DayNews\ArticleCommentController::class, 'report'])->name('comments.report');

    // Admin/moderator routes
    Route::middleware(['can:moderate,App\Models\ArticleComment'])->group(function () {
        Route::post('/comments/{comment}/pin', [App\Http\Controllers\DayNews\ArticleCommentController::class, 'togglePin'])->name('comments.pin');
        Route::post('/comments/{comment}/moderate', [App\Http\Controllers\DayNews\ArticleCommentController::class, 'moderate'])->name('comments.moderate');
    });
});

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

// Events routes
Route::get('/events', [App\Http\Controllers\DayNews\EventController::class, 'index'])->name('events.index');
Route::get('/events/{event}', [App\Http\Controllers\DayNews\EventController::class, 'show'])->name('events.show');

// Business directory routes
Route::get('/businesses', [App\Http\Controllers\DayNews\BusinessController::class, 'index'])->name('businesses.index');
Route::get('/businesses/{business:slug}', [App\Http\Controllers\DayNews\BusinessController::class, 'show'])->name('businesses.show');

// Tag routes
Route::get('/tag/{slug}', [App\Http\Controllers\DayNews\TagController::class, 'show'])->name('tags.show');

// Search routes
Route::get('/search', [App\Http\Controllers\DayNews\SearchController::class, 'index'])->name('search.index');
Route::get('/api/search/suggestions', [App\Http\Controllers\DayNews\SearchController::class, 'suggestions'])->name('search.suggestions');

// Announcements routes
Route::get('/announcements', [App\Http\Controllers\DayNews\AnnouncementController::class, 'index'])->name('announcements.index');

Route::middleware(['auth'])->group(function () {
    Route::get('/announcements/create', [App\Http\Controllers\DayNews\AnnouncementController::class, 'create'])->name('announcements.create');
    Route::post('/announcements', [App\Http\Controllers\DayNews\AnnouncementController::class, 'store'])->name('announcements.store');
    Route::get('/announcements/{announcement}/edit', [App\Http\Controllers\DayNews\AnnouncementController::class, 'edit'])->name('announcements.edit');
    Route::patch('/announcements/{announcement}', [App\Http\Controllers\DayNews\AnnouncementController::class, 'update'])->name('announcements.update');
    Route::delete('/announcements/{announcement}', [App\Http\Controllers\DayNews\AnnouncementController::class, 'destroy'])->name('announcements.destroy');
});

Route::get('/announcements/{announcement}', [App\Http\Controllers\DayNews\AnnouncementController::class, 'show'])->name('announcements.show');

// Classifieds routes
Route::get('/classifieds', [App\Http\Controllers\DayNews\ClassifiedController::class, 'index'])->name('classifieds.index');

// Public API: classified category specifications
Route::get('/api/classified-categories/{category}/specifications', [App\Http\Controllers\DayNews\ClassifiedController::class, 'categorySpecifications'])->name('api.classified-categories.specifications');

Route::middleware(['auth'])->group(function () {
    Route::get('/classifieds/create', [App\Http\Controllers\DayNews\ClassifiedController::class, 'create'])->name('classifieds.create');
    Route::post('/classifieds', [App\Http\Controllers\DayNews\ClassifiedController::class, 'store'])->name('classifieds.store');
    Route::get('/classifieds/my', [App\Http\Controllers\DayNews\ClassifiedController::class, 'myClassifieds'])->name('classifieds.my');
    Route::get('/classifieds/saved', [App\Http\Controllers\DayNews\ClassifiedController::class, 'savedClassifieds'])->name('classifieds.saved');
    Route::get('/classifieds/{classified}/edit', [App\Http\Controllers\DayNews\ClassifiedController::class, 'edit'])->name('classifieds.edit');
    Route::patch('/classifieds/{classified}', [App\Http\Controllers\DayNews\ClassifiedController::class, 'update'])->name('classifieds.update');
    Route::delete('/classifieds/{classified}', [App\Http\Controllers\DayNews\ClassifiedController::class, 'destroy'])->name('classifieds.destroy');
    Route::post('/classifieds/{classified}/toggle-save', [App\Http\Controllers\DayNews\ClassifiedController::class, 'toggleSave'])->name('classifieds.toggle-save');
    Route::post('/classifieds/contact', [App\Http\Controllers\DayNews\ClassifiedController::class, 'contact'])->name('classifieds.contact');
    Route::get('/classifieds/{classified}/select-regions', [App\Http\Controllers\DayNews\ClassifiedController::class, 'selectRegions'])->name('classifieds.select-regions');
    Route::post('/classifieds/{classified}/regions', [App\Http\Controllers\DayNews\ClassifiedController::class, 'storeRegions'])->name('classifieds.store-regions');
    Route::get('/classifieds/{classified}/select-timeframe', [App\Http\Controllers\DayNews\ClassifiedController::class, 'selectTimeframe'])->name('classifieds.select-timeframe');
    Route::post('/classifieds/{classified}/timeframe', [App\Http\Controllers\DayNews\ClassifiedController::class, 'storeTimeframe'])->name('classifieds.store-timeframe');
    Route::get('/classifieds/{classified}/payment/success', [App\Http\Controllers\DayNews\ClassifiedController::class, 'paymentSuccess'])->name('classifieds.payment.success');
    Route::get('/classifieds/{classified}/payment/cancel', [App\Http\Controllers\DayNews\ClassifiedController::class, 'paymentCancel'])->name('classifieds.payment.cancel');
    Route::get('/classifieds/{classified}/confirmation', [App\Http\Controllers\DayNews\ClassifiedController::class, 'confirmation'])->name('classifieds.confirmation');
    Route::post('/classifieds/{classified}/sold', [App\Http\Controllers\DayNews\ClassifiedController::class, 'markSold'])->name('classifieds.sold');
    Route::post('/classifieds/{classified}/reactivate', [App\Http\Controllers\DayNews\ClassifiedController::class, 'reactivate'])->name('classifieds.reactivate');
    Route::post('/classifieds/{classified}/report', [App\Http\Controllers\DayNews\ClassifiedController::class, 'report'])->name('classifieds.report');
});

Route::get('/classifieds/{classified}', [App\Http\Controllers\DayNews\ClassifiedController::class, 'show'])->name('classifieds.show');

// Coupons routes
Route::get('/coupons', [App\Http\Controllers\DayNews\CouponController::class, 'index'])->name('coupons.index');

Route::middleware(['auth'])->group(function () {
    Route::get('/coupons/my', [App\Http\Controllers\DayNews\CouponController::class, 'myCoupons'])->name('coupons.my');
    Route::get('/coupons/saved', [App\Http\Controllers\DayNews\CouponController::class, 'savedCoupons'])->name('coupons.saved');
    Route::get('/coupons/create', [App\Http\Controllers\DayNews\CouponController::class, 'create'])->name('coupons.create');
    Route::post('/coupons', [App\Http\Controllers\DayNews\CouponController::class, 'store'])->name('coupons.store');
    Route::get('/coupons/{coupon}/edit', [App\Http\Controllers\DayNews\CouponController::class, 'edit'])->name('coupons.edit');
    Route::patch('/coupons/{coupon}', [App\Http\Controllers\DayNews\CouponController::class, 'update'])->name('coupons.update');
    Route::delete('/coupons/{coupon}', [App\Http\Controllers\DayNews\CouponController::class, 'destroy'])->name('coupons.destroy');
    Route::post('/coupons/{coupon}/vote', [App\Http\Controllers\DayNews\CouponController::class, 'vote'])->name('coupons.vote');
    Route::post('/coupons/{coupon}/comments', [App\Http\Controllers\DayNews\CouponController::class, 'storeComment'])->name('coupons.comments.store');
    Route::post('/coupons/{coupon}/toggle-save', [App\Http\Controllers\DayNews\CouponController::class, 'toggleSave'])->name('coupons.toggle-save');
});

Route::get('/coupons/{coupon}', [App\Http\Controllers\DayNews\CouponController::class, 'show'])->name('coupons.show');
Route::post('/coupons/{coupon}/use', [App\Http\Controllers\DayNews\CouponController::class, 'use'])->name('coupons.use');

Route::middleware(['auth'])->group(function () {
    Route::post('/coupons/comments/{comment}/like', [App\Http\Controllers\DayNews\CouponController::class, 'toggleCommentLike'])->name('coupons.comments.like');
});

// Photos routes
Route::get('/photos', [App\Http\Controllers\DayNews\PhotoController::class, 'index'])->name('photos.index');
Route::get('/photos/albums', [App\Http\Controllers\DayNews\PhotoController::class, 'albums'])->name('photos.albums');
Route::get('/photos/albums/{album}', [App\Http\Controllers\DayNews\PhotoController::class, 'showAlbum'])->name('photos.album.show');

Route::middleware(['auth'])->group(function () {
    Route::get('/photos/create', [App\Http\Controllers\DayNews\PhotoController::class, 'create'])->name('photos.create');
    Route::post('/photos', [App\Http\Controllers\DayNews\PhotoController::class, 'store'])->name('photos.store');
    Route::delete('/photos/{photo}', [App\Http\Controllers\DayNews\PhotoController::class, 'destroy'])->name('photos.destroy');
    Route::get('/photos/albums/create', [App\Http\Controllers\DayNews\PhotoController::class, 'createAlbum'])->name('photos.albums.create');
    Route::post('/photos/albums', [App\Http\Controllers\DayNews\PhotoController::class, 'storeAlbum'])->name('photos.albums.store');
});

Route::get('/photos/{photo}', [App\Http\Controllers\DayNews\PhotoController::class, 'show'])->name('photos.show');

// Archive routes
Route::get('/archive', [App\Http\Controllers\DayNews\ArchiveController::class, 'index'])->name('archive.index');
Route::get('/archive/calendar/{year}/{month}', [App\Http\Controllers\DayNews\ArchiveController::class, 'calendar'])->name('archive.calendar');

// Trending routes
Route::get('/trending', [App\Http\Controllers\DayNews\TrendingController::class, 'index'])->name('trending.index');

// Authors routes
Route::get('/authors', [App\Http\Controllers\DayNews\AuthorController::class, 'index'])->name('authors.index');

Route::middleware(['auth'])->group(function () {
    Route::get('/authors/create', [App\Http\Controllers\DayNews\AuthorController::class, 'create'])->name('authors.create');
    Route::post('/authors', [App\Http\Controllers\DayNews\AuthorController::class, 'store'])->name('authors.store');
});

Route::get('/authors/{author}', [App\Http\Controllers\DayNews\AuthorController::class, 'show'])->name('authors.show')->where('author', '[a-z0-9\-]+');

// Legal Notices routes
Route::get('/legal-notices', [App\Http\Controllers\DayNews\LegalNoticeController::class, 'index'])->name('legal-notices.index');

Route::middleware(['auth'])->group(function () {
    Route::get('/legal-notices/create', [App\Http\Controllers\DayNews\LegalNoticeController::class, 'create'])->name('legal-notices.create');
    Route::post('/legal-notices', [App\Http\Controllers\DayNews\LegalNoticeController::class, 'store'])->name('legal-notices.store');
});

Route::get('/legal-notices/{notice}', [App\Http\Controllers\DayNews\LegalNoticeController::class, 'show'])->name('legal-notices.show');

// Memorials routes
Route::get('/memorials', [App\Http\Controllers\DayNews\MemorialController::class, 'index'])->name('memorials.index');

Route::middleware(['auth'])->group(function () {
    Route::get('/memorials/create', [App\Http\Controllers\DayNews\MemorialController::class, 'create'])->name('memorials.create');
    Route::post('/memorials', [App\Http\Controllers\DayNews\MemorialController::class, 'store'])->name('memorials.store');
});

Route::get('/memorials/{memorial}', [App\Http\Controllers\DayNews\MemorialController::class, 'show'])->name('memorials.show');

// Local Voices (Podcasts) routes
Route::get('/local-voices', [App\Http\Controllers\DayNews\CreatorController::class, 'index'])->name('local-voices.index');
Route::get('/local-voices/podcasts/{podcast:slug}', [App\Http\Controllers\DayNews\PodcastController::class, 'show'])->name('local-voices.podcast.show');
Route::get('/local-voices/podcasts/{podcast:slug}/episodes/{episode:slug}', [App\Http\Controllers\DayNews\PodcastController::class, 'showEpisode'])->name('local-voices.episode.show');

Route::middleware(['auth'])->group(function () {
    Route::get('/local-voices/register', [App\Http\Controllers\DayNews\CreatorController::class, 'create'])->name('local-voices.register');
    Route::post('/local-voices/register', [App\Http\Controllers\DayNews\CreatorController::class, 'store'])->name('local-voices.register.store');
    Route::get('/local-voices/dashboard', [App\Http\Controllers\DayNews\CreatorController::class, 'dashboard'])->name('local-voices.dashboard');

    Route::get('/local-voices/podcasts/create', [App\Http\Controllers\DayNews\PodcastController::class, 'create'])->name('local-voices.podcast.create');
    Route::post('/local-voices/podcasts', [App\Http\Controllers\DayNews\PodcastController::class, 'store'])->name('local-voices.podcast.store');
    Route::get('/local-voices/podcasts/{podcast:slug}/episodes/create', [App\Http\Controllers\DayNews\PodcastController::class, 'createEpisode'])->name('local-voices.episode.create');
    Route::post('/local-voices/podcasts/{podcast:slug}/episodes', [App\Http\Controllers\DayNews\PodcastController::class, 'storeEpisode'])->name('local-voices.episode.store');
    Route::post('/local-voices/podcasts/{podcast:slug}/episodes/{episode:slug}/publish', [App\Http\Controllers\DayNews\PodcastController::class, 'publishEpisode'])->name('local-voices.episode.publish');
});

// Region-specific homepage (must come LAST to avoid matching other routes)
// Auth routes are loaded before this file in bootstrap/app.php, so they take precedence
Route::get('/{regionSlug}', [RegionHomeController::class, 'show'])
    ->where('regionSlug', '[a-z0-9\-]+')
    ->name('region.home');
