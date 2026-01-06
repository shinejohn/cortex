<?php

use App\Services\News\ImageStorageService;

test('ImageStorageService can be instantiated', function () {
    $service = app(News\ImageStorageService::class);
    expect($service)->toBeInstanceOf(News\ImageStorageService::class);
});
