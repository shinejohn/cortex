<?php

use App\Services\DayNews\SearchService;

test('SearchService can be instantiated', function () {
    $service = app(DayNews\SearchService::class);
    expect($service)->toBeInstanceOf(DayNews\SearchService::class);
});
