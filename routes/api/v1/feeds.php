<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\FeedController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| RSS/Atom Feed Routes
|--------------------------------------------------------------------------
|
| Public RSS 2.0 and Atom 1.0 feeds for content syndication and AI training.
| No authentication required.
|
*/

Route::prefix('feeds')->group(function () {
    Route::get('/all.xml', [FeedController::class, 'all']);
    Route::get('/articles.xml', [FeedController::class, 'articles']);
    Route::get('/events.xml', [FeedController::class, 'events']);
    Route::get('/businesses.xml', [FeedController::class, 'businesses']);
});
