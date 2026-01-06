<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\PhotoController;
use Illuminate\Support\Facades\Route;

Route::prefix('photos')->group(function () {
    Route::get('/', [PhotoController::class, 'index']);
    Route::get('/{photo}', [PhotoController::class, 'show']);
    Route::post('/', [PhotoController::class, 'store']);
    Route::put('/{photo}', [PhotoController::class, 'update']);
    Route::delete('/{photo}', [PhotoController::class, 'destroy']);
});

Route::prefix('photo-albums')->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\V1\PhotoAlbumController::class, 'index']);
    Route::get('/{photoAlbum}', [\App\Http\Controllers\Api\V1\PhotoAlbumController::class, 'show']);
    Route::post('/', [\App\Http\Controllers\Api\V1\PhotoAlbumController::class, 'store']);
    Route::put('/{photoAlbum}', [\App\Http\Controllers\Api\V1\PhotoAlbumController::class, 'update']);
    Route::post('/{photoAlbum}/photos', [\App\Http\Controllers\Api\V1\PhotoAlbumController::class, 'addPhotos']);
});


