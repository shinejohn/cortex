<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// DowntownGuide Coming Soon page
Route::get('/', function () {
    return Inertia::render('downtown-guide/index');
})->name('downtown-guide.home');
