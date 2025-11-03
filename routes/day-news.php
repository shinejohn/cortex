<?php

declare(strict_types=1);

use App\Http\Controllers\Api\LocationController;
use App\Models\News;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// DayNews home page
Route::get('/', function () {
    $currentRegion = request()->attributes->get('detected_region');

    // Get news for the current region
    $newsQuery = News::published()
        ->with(['author', 'regions'])
        ->recent();

    if ($currentRegion) {
        // Get news for this region and its parent regions
        $regionIds = [$currentRegion->id];
        if ($currentRegion->parent_id) {
            $regionIds[] = $currentRegion->parent_id;
            // Get grandparent if exists
            $parent = $currentRegion->parent;
            if ($parent && $parent->parent_id) {
                $regionIds[] = $parent->parent_id;
            }
        }

        $newsQuery->whereHas('regions', function ($q) use ($regionIds) {
            $q->whereIn('regions.id', $regionIds);
        });
    }

    $news = $newsQuery->limit(20)->get();

    return Inertia::render('day-news/index', [
        'news' => $news,
        'hasRegion' => $currentRegion !== null,
    ]);
})->name('day-news.home');

// Location API routes
Route::prefix('api/location')->name('api.location.')->group(function () {
    Route::post('/detect-browser', [LocationController::class, 'detectFromBrowser'])->name('detect-browser');
    Route::post('/set-region', [LocationController::class, 'setRegion'])->name('set-region');
    Route::get('/search', [LocationController::class, 'search'])->name('search');
    Route::post('/clear', [LocationController::class, 'clear'])->name('clear');
});
