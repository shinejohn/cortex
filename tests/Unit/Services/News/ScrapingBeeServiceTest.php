<?php

use App\Services\News\ScrapingBeeService;

test('ScrapingBeeService can be instantiated', function () {
    $service = app(News\ScrapingBeeService::class);
    expect($service)->toBeInstanceOf(News\ScrapingBeeService::class);
});
