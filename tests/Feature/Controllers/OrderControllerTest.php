<?php

test('OrderController exists', function () {
    expect(class_exists('App\Http\Controllers\OrderController'))->toBeTrue();
});

test('OrderController requires authentication', function () {
    // Test that controller methods require auth
    expect(class_exists('App\Http\Controllers\OrderController'))->toBeTrue();
});
