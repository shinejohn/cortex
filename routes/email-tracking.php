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

Route::get('/email/track/open/{send}', [TrackingController::class, 'trackOpen'])->name('email.track.open');
Route::get('/email/track/click/{send}', [TrackingController::class, 'trackClick'])->name('email.track.click');
Route::get('/email/unsubscribe/{subscriber:uuid}', [TrackingController::class, 'unsubscribe'])->name('email.unsubscribe');
Route::post('/email/unsubscribe/{subscriber:uuid}', [TrackingController::class, 'processUnsubscribe'])->name('email.unsubscribe.process');
Route::get('/email/preferences/{subscriber:uuid}', [TrackingController::class, 'preferences'])->name('email.preferences');
Route::post('/email/preferences/{subscriber:uuid}', [TrackingController::class, 'updatePreferences'])->name('email.preferences.update');

