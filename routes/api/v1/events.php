<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\EventController;
use Illuminate\Support\Facades\Route;

Route::prefix('events')->group(function () {
    Route::get('/', [EventController::class, 'index']);
    Route::get('/upcoming', [EventController::class, 'upcoming']);
    Route::get('/calendar', [EventController::class, 'calendar']);
    Route::get('/{event}', [EventController::class, 'show']);
    Route::post('/', [EventController::class, 'store']);
    Route::put('/{event}', [EventController::class, 'update']);
    Route::delete('/{event}', [EventController::class, 'destroy']);
    Route::post('/{event}/rsvp', [EventController::class, 'rsvp']);
});


