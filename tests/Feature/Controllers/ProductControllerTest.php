<?php

use App\Http\Controllers\ProductController;

test('ProductController exists', function () {
    expect(class_exists("App\\Http\\Controllers\\ProductController"))->toBeTrue();
});
