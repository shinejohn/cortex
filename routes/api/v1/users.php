<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\SocialAccountController;
use Illuminate\Support\Facades\Route;

Route::prefix('users')->group(function () {
    Route::get('/', [UserController::class, 'index']);
    Route::get('/me', [UserController::class, 'me']);
    Route::get('/{user}', [UserController::class, 'show']);
    Route::post('/', [UserController::class, 'store']);
    Route::put('/{user}', [UserController::class, 'update']);
    Route::delete('/{user}', [UserController::class, 'destroy']);
    Route::get('/{user}/posts', [UserController::class, 'posts']);
    Route::get('/{user}/activity', [UserController::class, 'activity']);
    Route::get('/{user}/social-accounts', [SocialAccountController::class, 'index']);
    Route::post('/{user}/social-accounts', [SocialAccountController::class, 'store']);
});

Route::prefix('social-accounts')->group(function () {
    Route::delete('/{socialAccount}', [SocialAccountController::class, 'destroy']);
});
