<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\MemorialController;
use Illuminate\Support\Facades\Route;

Route::prefix('memorials')->group(function () {
    Route::get('/', [MemorialController::class, 'index']);
    Route::get('/{memorial}', [MemorialController::class, 'show']);
    Route::post('/', [MemorialController::class, 'store']);
    Route::put('/{memorial}', [MemorialController::class, 'update']);
    Route::get('/{memorial}/tributes', [MemorialController::class, 'tributes']);
});


