<?php

use App\Http\Controllers\Api\AdvertisementController;

test('AdvertisementController exists', function () {
    expect(class_exists("App\\Http\\Controllers\\Api\AdvertisementController"))->toBeTrue();
});
