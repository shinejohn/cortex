<?php

use App\Services\GeocodingService;

test('GeocodingService can be instantiated', function () {
    $service = app(App\Services\GeocodingService::class);
    expect($service)->toBeInstanceOf(App\Services\GeocodingService::class);
});
