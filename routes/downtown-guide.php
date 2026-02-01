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
    // #region agent log
    \Illuminate\Support\Facades\Log::info('DTG Route entered', ['host' => request()->getHost(), 'domain' => config('domains.downtown-guide'), 'appDomain' => config('app.current_domain')]);
    file_put_contents('/Users/johnshine/Dropbox/Fibonacco/Day-News/Multisite/.cursor/debug.log', json_encode(['location'=>'routes/downtown-guide.php:21','message'=>'Route closure entered','data'=>['host'=>request()->getHost(),'domain'=>config('domains.downtown-guide'),'appDomain'=>config('app.current_domain')],'timestamp'=>time()*1000,'sessionId'=>'debug-session','runId'=>'run1','hypothesisId'=>'A'])."\n", FILE_APPEND);
    // #endregion
    try {
        // #region agent log
        \Illuminate\Support\Facades\Log::info('DTG Before Inertia render', ['page' => 'downtown-guide/home']);
        file_put_contents('/Users/johnshine/Dropbox/Fibonacco/Day-News/Multisite/.cursor/debug.log', json_encode(['location'=>'routes/downtown-guide.php:24','message'=>'Before Inertia render','data'=>['page'=>'downtown-guide/home'],'timestamp'=>time()*1000,'sessionId'=>'debug-session','runId'=>'run1','hypothesisId'=>'C'])."\n", FILE_APPEND);
        // #endregion
        $response = Inertia::render('downtown-guide/home');
        // #region agent log
        \Illuminate\Support\Facades\Log::info('DTG After Inertia render', ['responseType' => get_class($response)]);
        file_put_contents('/Users/johnshine/Dropbox/Fibonacco/Day-News/Multisite/.cursor/debug.log', json_encode(['location'=>'routes/downtown-guide.php:28','message'=>'After Inertia render','data'=>['responseType'=>get_class($response)],'timestamp'=>time()*1000,'sessionId'=>'debug-session','runId'=>'run1','hypothesisId'=>'C'])."\n", FILE_APPEND);
        // #endregion
        return $response;
    } catch (\Throwable $e) {
        // #region agent log
        \Illuminate\Support\Facades\Log::error('DTG Exception in route', ['error' => $e->getMessage(), 'file' => $e->getFile(), 'line' => $e->getLine()]);
        file_put_contents('/Users/johnshine/Dropbox/Fibonacco/Day-News/Multisite/.cursor/debug.log', json_encode(['location'=>'routes/downtown-guide.php:32','message'=>'Exception in route closure','data'=>['error'=>$e->getMessage(),'file'=>$e->getFile(),'line'=>$e->getLine()],'timestamp'=>time()*1000,'sessionId'=>'debug-session','runId'=>'run1','hypothesisId'=>'C'])."\n", FILE_APPEND);
        // #endregion
        throw $e;
    }
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
