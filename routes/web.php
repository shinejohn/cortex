<?php

declare(strict_types=1);

use App\Http\Controllers\EventsController;
use App\Http\Controllers\HomePageController;
use App\Http\Controllers\PerformersController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomePageController::class, 'index'])->name('home');
Route::get('/events', [EventsController::class, 'index'])->name('events');
Route::get('/performers', [PerformersController::class, 'index'])->name('performers');

Route::middleware(['auth', 'verified'])->group(function () {
    // Route::get('dashboard', function () {
    //     return Inertia::render('dashboard');
    // })->name('dashboard');
});

require __DIR__ . '/workspace.php';
require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
