<?php

declare(strict_types=1);

use App\Http\Controllers\DayNews\CreatorController;
use App\Http\Controllers\DayNews\PodcastController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Go Local Voices Routes (Standalone Domain)
|--------------------------------------------------------------------------
|
| Routes for the standalone Go Local Voices platform.
| Domain: golocalvoices.com
|
*/

// Public routes
Route::get('/', [CreatorController::class, 'index'])->name('localvoices.index');
Route::get('/podcasts/{podcast:slug}', [PodcastController::class, 'show'])->name('localvoices.podcast.show');
Route::get('/podcasts/{podcast:slug}/episodes/{episode:slug}', [PodcastController::class, 'showEpisode'])->name('localvoices.episode.show');

// Authenticated routes
Route::middleware(['auth'])->group(function () {
    Route::get('/register', [CreatorController::class, 'create'])->name('localvoices.register');
    Route::post('/register', [CreatorController::class, 'store'])->name('localvoices.register.store');
    Route::get('/dashboard', [CreatorController::class, 'dashboard'])->name('localvoices.dashboard');
    
    Route::get('/podcasts/create', [PodcastController::class, 'create'])->name('localvoices.podcast.create');
    Route::post('/podcasts', [PodcastController::class, 'store'])->name('localvoices.podcast.store');
    Route::get('/podcasts/{podcast:slug}/episodes/create', [PodcastController::class, 'createEpisode'])->name('localvoices.episode.create');
    Route::post('/podcasts/{podcast:slug}/episodes', [PodcastController::class, 'storeEpisode'])->name('localvoices.episode.store');
    Route::post('/podcasts/{podcast:slug}/episodes/{episode:slug}/publish', [PodcastController::class, 'publishEpisode'])->name('localvoices.episode.publish');
});

