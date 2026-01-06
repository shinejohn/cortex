<?php

use App\Http\Controllers\Api\LocationController;

test('LocationController exists', function () {
    expect(class_exists("App\\Http\\Controllers\\Api\LocationController"))->toBeTrue();
});
