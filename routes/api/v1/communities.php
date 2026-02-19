<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\CommunityController;
use App\Http\Controllers\Api\V1\CommunityThreadController;
use Illuminate\Support\Facades\Route;

Route::prefix('communities')->group(function () {
    Route::get('/', [CommunityController::class, 'index']);
    Route::get('/{community}', [CommunityController::class, 'show']);
    Route::post('/', [CommunityController::class, 'store']);
    Route::put('/{community}', [CommunityController::class, 'update']);
    Route::get('/{community}/threads', [CommunityController::class, 'threads']);
    Route::get('/{community}/members', [CommunityController::class, 'members']);
    Route::get('/{community}/businesses', [CommunityController::class, 'businesses']);
});

Route::prefix('community-threads')->group(function () {
    Route::get('/{communityThread}', [CommunityThreadController::class, 'show']);
    Route::post('/communities/{community}', [CommunityThreadController::class, 'store']);
    Route::put('/{communityThread}', [CommunityThreadController::class, 'update']);
    Route::delete('/{communityThread}', [CommunityThreadController::class, 'destroy']);
});
