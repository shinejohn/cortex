<?php

use App\Services\CacheService;

test('CacheService can be instantiated', function () {
    $service = app(App\Services\CacheService::class);
    expect($service)->toBeInstanceOf(App\Services\CacheService::class);
});
