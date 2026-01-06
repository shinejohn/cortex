<?php

use App\Services\AdvertisementService;

test('AdvertisementService can be instantiated', function () {
    $service = app(App\Services\AdvertisementService::class);
    expect($service)->toBeInstanceOf(App\Services\AdvertisementService::class);
});
