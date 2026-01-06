<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\PostController;
use Illuminate\Support\Facades\Route;

Route::prefix('posts')->group(function () {
    Route::get('/', [PostController::class, 'index']);
    Route::get('/featured', [PostController::class, 'featured']);
    Route::get('/trending', [PostController::class, 'trending']);
    Route::get('/slug/{slug}', [PostController::class, 'showBySlug']);
    Route::get('/{post}', [PostController::class, 'show']);
    Route::post('/', [PostController::class, 'store']);
    Route::put('/{post}', [PostController::class, 'update']);
    Route::patch('/{post}/publish', [PostController::class, 'publish']);
    Route::patch('/{post}/unpublish', [PostController::class, 'unpublish']);
    Route::delete('/{post}', [PostController::class, 'destroy']);
    Route::get('/{post}/regions', [PostController::class, 'regions']);
    Route::post('/{post}/regions', [PostController::class, 'addRegion']);
    Route::delete('/{post}/regions/{regionId}', [PostController::class, 'removeRegion']);
    Route::get('/{post}/tags', [PostController::class, 'tags']);
    Route::post('/{post}/tags', [PostController::class, 'addTags']);
    Route::delete('/{post}/tags/{tagId}', [PostController::class, 'removeTag']);
    Route::get('/{post}/comments', [PostController::class, 'comments']);
    Route::get('/{post}/payments', [PostController::class, 'payments']);
    Route::post('/{post}/sponsor', [PostController::class, 'sponsor']);
});


