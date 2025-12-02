<?php

declare(strict_types=1);

use App\Http\Controllers\DowntownGuide\SitemapController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Sitemap routes
Route::get('/robots.txt', [SitemapController::class, 'robots'])->name('downtown-guide.robots');
Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('downtown-guide.sitemap.index');

// DowntownGuide Coming Soon page
Route::get('/', function () {
    return Inertia::render('downtown-guide/index');
})->name('downtown-guide.home');
