<?php

use App\Http\Controllers\DayNews\PhotoController;

test('PhotoController exists', function () {
    expect(class_exists("App\\Http\\Controllers\\DayNews\PhotoController"))->toBeTrue();
});
