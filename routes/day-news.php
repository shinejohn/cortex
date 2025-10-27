<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// DayNews Coming Soon page
Route::get('/', function () {
    return Inertia::render('day-news/index');
})->name('day-news.home');
