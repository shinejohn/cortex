<?php

use App\Services\News\UnsplashService;

test('UnsplashService can be instantiated', function () {
    $service = app(News\UnsplashService::class);
    expect($service)->toBeInstanceOf(News\UnsplashService::class);
});
