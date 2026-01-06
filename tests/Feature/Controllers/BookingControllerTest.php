<?php

use App\Http\Controllers\BookingController;

test('BookingController exists', function () {
    expect(class_exists("App\\Http\\Controllers\\BookingController"))->toBeTrue();
});
