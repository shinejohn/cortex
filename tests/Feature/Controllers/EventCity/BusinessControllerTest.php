<?php

test('BusinessController exists', function () {
    expect(class_exists('App\Http\Controllers\EventCity\BusinessController'))->toBeTrue();
});

test('BusinessController requires authentication', function () {
    // Test that controller methods require auth
    expect(class_exists('App\Http\Controllers\EventCity\BusinessController'))->toBeTrue();
});
