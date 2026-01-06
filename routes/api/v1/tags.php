<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\TagController;
use Illuminate\Support\Facades\Route;

Route::prefix('tags')->group(function () {
    Route::get('/', [TagController::class, 'index']);
    Route::get('/{slug}', [TagController::class, 'show']);
    Route::get('/{tag}/posts', [TagController::class, 'posts']);
    Route::post('/', [TagController::class, 'store']);
    Route::put('/{tag}', [TagController::class, 'update']);
    Route::delete('/{tag}', [TagController::class, 'destroy']);
});


