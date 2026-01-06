<?php

use App\Http\Controllers\DayNews\BusinessController;

test('BusinessController exists', function () {
    expect(class_exists("App\\Http\\Controllers\\DayNews\BusinessController"))->toBeTrue();
});
