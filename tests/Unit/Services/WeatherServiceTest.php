<?php

use App\Services\WeatherService;

test('WeatherService can be instantiated', function () {
    $service = app(App\Services\WeatherService::class);
    expect($service)->toBeInstanceOf(App\Services\WeatherService::class);
});
