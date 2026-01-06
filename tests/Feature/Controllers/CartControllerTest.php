<?php

use App\Http\Controllers\CartController;

test('CartController exists', function () {
    expect(class_exists("App\\Http\\Controllers\\CartController"))->toBeTrue();
});
