<?php

declare(strict_types=1);

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule Day News ad expiration checks
Schedule::command('ads:expire')->hourly();

// Schedule Day News post expiration checks
Schedule::command('ads:expire-posts')->hourly();

// Schedule news workflow - Daily workflow at 6:00 AM UTC (dispatches jobs for parallel processing)
Schedule::command('news:run-daily')->dailyAt('06:00');

// Schedule news workflow - Business discovery on 1st of each month at 3:00 AM UTC (dispatches jobs for parallel processing)
// Schedule::command('news:discover-businesses')->monthlyOn(1, '03:00');

// Update MaxMind GeoIP database weekly
Schedule::command('location:update')->weekly();
