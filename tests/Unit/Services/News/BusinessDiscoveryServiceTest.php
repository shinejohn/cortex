<?php

use App\Services\News\BusinessDiscoveryService;

test('BusinessDiscoveryService can be instantiated', function () {
    $service = app(News\BusinessDiscoveryService::class);
    expect($service)->toBeInstanceOf(News\BusinessDiscoveryService::class);
});
