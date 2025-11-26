<?php

declare(strict_types=1);

use App\Jobs\News\ProcessRegionBusinessDiscoveryJob;
use App\Jobs\News\ProcessRegionDailyWorkflowJob;
use App\Models\Region;
use App\Services\AdvertisementService;
use App\Services\DayNewsPostService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule Day News ad expiration checks
Schedule::call(function () {
    $adService = app(AdvertisementService::class);
    $adService->expireExpiredAds();
})->hourly()->name('expire-advertisements');

// Schedule Day News post expiration checks
Schedule::call(function () {
    $postService = app(DayNewsPostService::class);
    $postService->expireAds();
})->hourly()->name('expire-day-news-ads');

// Schedule news workflow - Daily workflow at 6:00 AM (dispatches jobs for parallel processing)
Schedule::call(function () {
    $regions = Region::active()
        ->get()
        ->filter(fn (Region $region) => $region->metadata['workflow_enabled'] ?? true);

    foreach ($regions as $region) {
        ProcessRegionDailyWorkflowJob::dispatch($region);
    }

    Log::info('Dispatched daily workflow jobs', [
        'count' => $regions->count(),
    ]);
})->dailyAt('06:00')->name('news-daily-workflow');

// Schedule news workflow - Business discovery on 1st of each month at 3:00 AM (dispatches jobs for parallel processing)
Schedule::call(function () {
    $regions = Region::active()->get();

    foreach ($regions as $region) {
        ProcessRegionBusinessDiscoveryJob::dispatch($region);
    }

    Log::info('Dispatched business discovery jobs', [
        'count' => $regions->count(),
    ]);
})->monthlyOn(1, '03:00')->name('news-business-discovery');
