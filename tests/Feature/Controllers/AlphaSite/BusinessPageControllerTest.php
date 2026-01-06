<?php

use App\Http\Controllers\AlphaSite\BusinessPageController;

test('BusinessPageController exists', function () {
    expect(class_exists("App\\Http\\Controllers\\AlphaSite\BusinessPageController"))->toBeTrue();
});
