<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\AdvertisementController;
use Illuminate\Support\Facades\Route;

Route::prefix('advertisements')->group(function () {
    Route::get('/', [AdvertisementController::class, 'index']);
    Route::post('/{advertisement}/impression', [AdvertisementController::class, 'trackImpression']);
    Route::post('/{advertisement}/click', [AdvertisementController::class, 'trackClick']);
});


