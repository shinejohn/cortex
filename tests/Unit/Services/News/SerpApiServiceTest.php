<?php

use App\Services\News\SerpApiService;

test('SerpApiService can be instantiated', function () {
    $service = app(News\SerpApiService::class);
    expect($service)->toBeInstanceOf(News\SerpApiService::class);
});
