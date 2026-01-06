<?php

use App\Services\News\NewsCollectionService;

test('NewsCollectionService can be instantiated', function () {
    $service = app(News\NewsCollectionService::class);
    expect($service)->toBeInstanceOf(News\NewsCollectionService::class);
});
