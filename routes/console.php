<?php

declare(strict_types=1);

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

// Artisan::command('inspire', function () {
//     $this->comment(Inspiring::quote());
// })->purpose('Display an inspiring quote');

// Schedule Day News ad expiration checks
Schedule::command('ads:expire')->hourly()->withoutOverlapping()->runInBackground();

// Schedule Day News post expiration checks
Schedule::command('ads:expire-posts')->hourly()->withoutOverlapping()->runInBackground();

// Schedule news workflow - Daily workflow at 6:00 AM UTC (dispatches jobs for parallel processing)
Schedule::command('news:run-daily')->dailyAt('06:00')->withoutOverlapping()->runInBackground();

// Schedule news workflow - Business discovery on 1st of each month at 3:00 AM UTC (dispatches jobs for parallel processing)
// Schedule::command('news:discover-businesses')->monthlyOn(1, '03:00')->withoutOverlapping()->runInBackground();

// Update MaxMind GeoIP database weekly
Schedule::command('location:update')->weekly()->withoutOverlapping()->runInBackground();

// Email system scheduled commands
Schedule::command('email:generate-digests')->dailyAt('02:00')->withoutOverlapping()->runInBackground();
Schedule::command('email:generate-newsletters')->weeklyOn(6, '22:00')->withoutOverlapping()->runInBackground(); // Saturday at 10 PM
Schedule::command('email:generate-smb-reports')->weeklyOn(0, '18:00')->withoutOverlapping()->runInBackground(); // Sunday at 6 PM
Schedule::command('email:process-queue')->everyMinute()->withoutOverlapping()->runInBackground();

// AI Newsroom Schedule - CRITICAL: These run frequently, MUST have withoutOverlapping()
Schedule::command('newsroom:collect')->everyFifteenMinutes()->withoutOverlapping()->runInBackground();
Schedule::command('newsroom:classify')->everyTenMinutes()->withoutOverlapping()->runInBackground();
Schedule::command('newsroom:process')->everyFiveMinutes()->withoutOverlapping()->runInBackground();

