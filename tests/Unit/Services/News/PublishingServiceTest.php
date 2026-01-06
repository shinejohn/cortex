<?php

use App\Services\News\PublishingService;

test('PublishingService can be instantiated', function () {
    $service = app(News\PublishingService::class);
    expect($service)->toBeInstanceOf(News\PublishingService::class);
});
