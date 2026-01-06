<?php

use App\Services\News\EventPublishingService;

test('EventPublishingService can be instantiated', function () {
    $service = app(News\EventPublishingService::class);
    expect($service)->toBeInstanceOf(News\EventPublishingService::class);
});
