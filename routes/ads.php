<?php

declare(strict_types=1);

use App\Http\Controllers\Ads\AdController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Ad Serving Routes
|--------------------------------------------------------------------------
|
| Public routes for serving ads and tracking clicks
|
*/

Route::get('/ads/serve', [AdController::class, 'serve'])->name('ads.serve');
Route::get('/ads/click/{impression}', [AdController::class, 'click'])->name('ads.click');

