<?php

use App\Services\DayNews\ClassifiedService\ClassifiedService;

test('ClassifiedService can be instantiated', function () {
    $service = app(App\Services\DayNews\ClassifiedService\ClassifiedService::class);
    expect($service)->toBeInstanceOf(App\Services\DayNews\ClassifiedService\ClassifiedService::class);
});
