<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\SocialPostController;
use App\Http\Controllers\Api\V1\SocialGroupController;
use Illuminate\Support\Facades\Route;

Route::prefix('social-posts')->group(function () {
    Route::get('/', [SocialPostController::class, 'index']);
    Route::get('/{socialPost}', [SocialPostController::class, 'show']);
    Route::post('/', [SocialPostController::class, 'store']);
    Route::put('/{socialPost}', [SocialPostController::class, 'update']);
    Route::delete('/{socialPost}', [SocialPostController::class, 'destroy']);
    Route::post('/{socialPost}/like', [SocialPostController::class, 'like']);
    Route::delete('/{socialPost}/like', [SocialPostController::class, 'unlike']);
});

Route::prefix('social-groups')->group(function () {
    Route::get('/', [SocialGroupController::class, 'index']);
    Route::get('/{socialGroup}', [SocialGroupController::class, 'show']);
    Route::post('/', [SocialGroupController::class, 'store']);
    Route::put('/{socialGroup}', [SocialGroupController::class, 'update']);
    Route::post('/{socialGroup}/join', [SocialGroupController::class, 'join']);
    Route::delete('/{socialGroup}/leave', [SocialGroupController::class, 'leave']);
});


