<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\VenueController;
use Illuminate\Support\Facades\Route;

Route::prefix('venues')->group(function () {
    Route::get('/', [VenueController::class, 'index']);
    Route::get('/nearby', [VenueController::class, 'nearby']);
    Route::get('/featured', [VenueController::class, 'featured']);
    Route::get('/{venue}', [VenueController::class, 'show']);
    Route::post('/', [VenueController::class, 'store']);
    Route::put('/{venue}', [VenueController::class, 'update']);
    Route::get('/{venue}/events', [VenueController::class, 'events']);
});


