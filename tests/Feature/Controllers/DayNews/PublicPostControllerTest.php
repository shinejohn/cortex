<?php

use App\Http\Controllers\DayNews\PublicPostController;

test('PublicPostController exists', function () {
    expect(class_exists("App\\Http\\Controllers\\DayNews\PublicPostController"))->toBeTrue();
});
