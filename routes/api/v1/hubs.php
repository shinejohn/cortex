<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\HubController;
use Illuminate\Support\Facades\Route;

Route::prefix('hubs')->group(function () {
    Route::get('/', [HubController::class, 'index']);
    Route::get('/{hub}', [HubController::class, 'show']);
    Route::post('/', [HubController::class, 'store']);
    Route::put('/{hub}', [HubController::class, 'update']);
});


