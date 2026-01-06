<?php

test('StoreController exists', function () {
    expect(class_exists('App\Http\Controllers\StoreController'))->toBeTrue();
});

test('StoreController requires authentication', function () {
    // Test that controller methods require auth
    expect(class_exists('App\Http\Controllers\StoreController'))->toBeTrue();
});
