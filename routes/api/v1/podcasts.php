<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\PodcastController;
use App\Http\Controllers\Api\V1\PodcastEpisodeController;
use Illuminate\Support\Facades\Route;

Route::prefix('podcasts')->group(function () {
    Route::get('/', [PodcastController::class, 'index']);
    Route::get('/{podcast}', [PodcastController::class, 'show']);
    Route::post('/', [PodcastController::class, 'store']);
    Route::put('/{podcast}', [PodcastController::class, 'update']);
    Route::get('/{podcast}/episodes', [PodcastController::class, 'episodes']);
});

Route::prefix('podcast-episodes')->group(function () {
    Route::get('/', [PodcastEpisodeController::class, 'index']);
    Route::get('/{podcastEpisode}', [PodcastEpisodeController::class, 'show']);
    Route::post('/', [PodcastEpisodeController::class, 'store']);
    Route::put('/{podcastEpisode}', [PodcastEpisodeController::class, 'update']);
    Route::delete('/{podcastEpisode}', [PodcastEpisodeController::class, 'destroy']);
    Route::post('/{podcastEpisode}/play', [PodcastEpisodeController::class, 'play']);
});

Route::prefix('creator-profiles')->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\V1\CreatorProfileController::class, 'index']);
    Route::get('/{creatorProfile}', [\App\Http\Controllers\Api\V1\CreatorProfileController::class, 'show']);
    Route::post('/', [\App\Http\Controllers\Api\V1\CreatorProfileController::class, 'store']);
    Route::put('/{creatorProfile}', [\App\Http\Controllers\Api\V1\CreatorProfileController::class, 'update']);
    Route::get('/{creatorProfile}/content', [\App\Http\Controllers\Api\V1\CreatorProfileController::class, 'content']);
    Route::post('/{creatorProfile}/follow', [\App\Http\Controllers\Api\V1\CreatorProfileController::class, 'follow']);
});


