<?php

declare(strict_types=1);

use App\Http\Controllers\BookingController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\HomePageController;
use App\Http\Controllers\PerformerController;
use App\Http\Controllers\VenueController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::get('/', [HomePageController::class, 'index'])->name('home');
Route::get('/events', [EventController::class, 'publicIndex'])->name('events');
Route::get('/events/{event}', [EventController::class, 'show'])->name('events.show')->can('view', 'event');
Route::get('/performers', [PerformerController::class, 'publicIndex'])->name('performers');
Route::get('/performers/{performer}', [PerformerController::class, 'show'])->name('performers.show')->can('view', 'performer');
Route::get('/venues', [VenueController::class, 'publicIndex'])->name('venues');
Route::get('/venues/{venue}', [VenueController::class, 'show'])->name('venues.show')->can('view', 'venue');

// API routes for frontend data
Route::middleware(['auth'])->group(function () {
    Route::get('/api/events/featured', [EventController::class, 'featured'])->name('api.events.featured');
    Route::get('/api/events/upcoming', [EventController::class, 'upcoming'])->name('api.events.upcoming');
    Route::get('/api/venues/featured', [VenueController::class, 'featured'])->name('api.venues.featured');
    Route::get('/api/performers/featured', [PerformerController::class, 'featured'])->name('api.performers.featured');
    Route::get('/api/performers/trending', [PerformerController::class, 'trending'])->name('api.performers.trending');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Resource routes for CRUD operations (excluding index and show for events/performers/venues since they have public versions)
    Route::resource('venues', VenueController::class)->except(['index', 'show']);
    Route::resource('performers', PerformerController::class)->except(['index', 'show']);
    Route::resource('events', EventController::class)->except(['index', 'show']);
    Route::resource('bookings', BookingController::class);

    // Admin routes for events, performers, and venues management
    Route::get('/admin/events', [EventController::class, 'index'])->name('admin.events.index');
    Route::get('/admin/performers', [PerformerController::class, 'index'])->name('admin.performers.index');
    Route::get('/admin/venues', [VenueController::class, 'index'])->name('admin.venues.index');

    // Additional booking actions
    Route::patch('/bookings/{booking}/confirm', [BookingController::class, 'confirm'])->name('bookings.confirm');
    Route::patch('/bookings/{booking}/cancel', [BookingController::class, 'cancel'])->name('bookings.cancel');
});

require __DIR__ . '/workspace.php';
require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
