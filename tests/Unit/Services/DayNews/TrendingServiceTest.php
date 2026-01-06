<?php

use App\Services\DayNews\TrendingService;

test('TrendingService can be instantiated', function () {
    $service = app(DayNews\TrendingService::class);
    expect($service)->toBeInstanceOf(DayNews\TrendingService::class);
});
