<?php

use App\Http\Controllers\DayNews\PostPublishController;

test('PostPublishController exists', function () {
    expect(class_exists("App\\Http\\Controllers\\DayNews\PostPublishController"))->toBeTrue();
});
