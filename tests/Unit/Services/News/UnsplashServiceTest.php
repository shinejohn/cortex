<?php

declare(strict_types=1);

use App\Services\News\UnsplashService;

test('UnsplashService can be instantiated', function () {
    $service = app(UnsplashService::class);
    expect($service)->toBeInstanceOf(UnsplashService::class);
});
