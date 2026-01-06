<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\PerformerController;
use Illuminate\Support\Facades\Route;

Route::prefix('performers')->group(function () {
    Route::get('/', [PerformerController::class, 'index']);
    Route::get('/featured', [PerformerController::class, 'featured']);
    Route::get('/trending', [PerformerController::class, 'trending']);
    Route::get('/{performer}', [PerformerController::class, 'show']);
    Route::post('/', [PerformerController::class, 'store']);
    Route::put('/{performer}', [PerformerController::class, 'update']);
    Route::get('/{performer}/shows', [PerformerController::class, 'shows']);
});


