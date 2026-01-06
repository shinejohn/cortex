<?php

use App\Http\Controllers\HomePageController;

test('HomePageController exists', function () {
    expect(class_exists("App\\Http\\Controllers\\HomePageController"))->toBeTrue();
});
