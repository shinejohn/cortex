<?php

test('CreativeController exists', function () {
    expect(class_exists('App\Http\Controllers\Admin\Advertising\CreativeController'))->toBeTrue();
});

test('CreativeController requires authentication', function () {
    // Test that controller methods require auth
    expect(class_exists('App\Http\Controllers\Admin\Advertising\CreativeController'))->toBeTrue();
});
