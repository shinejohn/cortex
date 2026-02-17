<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\RolloutController;
use Illuminate\Support\Facades\Route;

Route::prefix('rollouts')->group(function () {
    Route::get('/', [RolloutController::class, 'index']);
    Route::get('/costs', [RolloutController::class, 'costs']);
    Route::post('/', [RolloutController::class, 'store']);
    Route::get('/{stateCode}', [RolloutController::class, 'show']);
    Route::get('/{stateCode}/communities/{communityId}', [RolloutController::class, 'communityDetail']);
    Route::patch('/{id}/pause', [RolloutController::class, 'pause']);
    Route::patch('/{id}/resume', [RolloutController::class, 'resume']);
});
