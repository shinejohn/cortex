<?php

use App\Services\News\ContentShortlistingService;

test('ContentShortlistingService can be instantiated', function () {
    $service = app(News\ContentShortlistingService::class);
    expect($service)->toBeInstanceOf(News\ContentShortlistingService::class);
});
