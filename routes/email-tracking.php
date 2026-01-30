<?php

declare(strict_types=1);

use App\Http\Controllers\Email\TrackingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Email Tracking Routes
|--------------------------------------------------------------------------
|
| Public routes for tracking email opens and clicks
|
*/

Route::get('/email/track/open/{send}', [TrackingController::class, 'trackOpen']);
Route::get('/email/track/click/{send}', [TrackingController::class, 'trackClick']);
Route::get('/email/unsubscribe/{subscriber:uuid}', [TrackingController::class, 'unsubscribe']);
Route::post('/email/unsubscribe/{subscriber:uuid}', [TrackingController::class, 'processUnsubscribe']);
Route::get('/email/preferences/{subscriber:uuid}', [TrackingController::class, 'preferences']);
Route::post('/email/preferences/{subscriber:uuid}', [TrackingController::class, 'updatePreferences']);

