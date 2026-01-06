<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\CalendarController;
use Illuminate\Support\Facades\Route;

Route::prefix('calendars')->group(function () {
    Route::get('/', [CalendarController::class, 'index']);
    Route::get('/{calendar}', [CalendarController::class, 'show']);
    Route::post('/', [CalendarController::class, 'store']);
    Route::get('/{calendar}/events', [CalendarController::class, 'events']);
    Route::post('/{calendar}/follow', [CalendarController::class, 'follow']);
});


