<?php

use App\Services\News\EventExtractionService;

test('EventExtractionService can be instantiated', function () {
    $service = app(News\EventExtractionService::class);
    expect($service)->toBeInstanceOf(News\EventExtractionService::class);
});
