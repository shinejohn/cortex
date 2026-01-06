<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\RegionController;
use App\Http\Controllers\Api\V1\RegionZipcodeController;
use Illuminate\Support\Facades\Route;

Route::prefix('regions')->group(function () {
    Route::get('/', [RegionController::class, 'index']);
    Route::get('/search', [RegionController::class, 'search']);
    Route::get('/{region}', [RegionController::class, 'show']);
    Route::post('/', [RegionController::class, 'store']);
    Route::put('/{region}', [RegionController::class, 'update']);
    Route::get('/{region}/content', [RegionController::class, 'content']);
    Route::get('/{region}/zipcodes', [RegionZipcodeController::class, 'index']);
    Route::post('/{region}/zipcodes', [RegionZipcodeController::class, 'store']);
});

Route::prefix('zipcodes')->group(function () {
    Route::get('/{code}/region', [RegionZipcodeController::class, 'findByZipcode']);
});


