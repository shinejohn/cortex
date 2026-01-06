<?php

use App\Services\HubAnalyticsService;

test('HubAnalyticsService can be instantiated', function () {
    $service = app(App\Services\HubAnalyticsService::class);
    expect($service)->toBeInstanceOf(App\Services\HubAnalyticsService::class);
});
