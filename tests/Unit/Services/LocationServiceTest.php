<?php

use App\Services\LocationService;

test('LocationService can be instantiated', function () {
    $service = app(LocationService::class);
    expect($service)->toBeInstanceOf(LocationService::class);
});
