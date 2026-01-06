<?php

use App\Services\News\VenueMatchingService;

test('VenueMatchingService can be instantiated', function () {
    $service = app(News\VenueMatchingService::class);
    expect($service)->toBeInstanceOf(News\VenueMatchingService::class);
});
