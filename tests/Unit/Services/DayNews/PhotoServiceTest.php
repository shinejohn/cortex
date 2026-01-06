<?php

use App\Services\DayNews\PhotoService\PhotoService;

test('PhotoService can be instantiated', function () {
    $service = app(App\Services\DayNews\PhotoService\PhotoService::class);
    expect($service)->toBeInstanceOf(App\Services\DayNews\PhotoService\PhotoService::class);
});
