<?php

use App\Services\News\PerformerMatchingService;

test('PerformerMatchingService can be instantiated', function () {
    $service = app(News\PerformerMatchingService::class);
    expect($service)->toBeInstanceOf(News\PerformerMatchingService::class);
});
