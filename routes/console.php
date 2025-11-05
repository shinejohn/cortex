<?php

declare(strict_types=1);

use App\Services\AdvertisementService;
use App\Services\DayNewsPostService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
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
