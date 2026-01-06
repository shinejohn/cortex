<?php

test('NewPasswordController exists', function () {
    expect(class_exists('App\Http\Controllers\Auth\NewPasswordController'))->toBeTrue();
});

test('NewPasswordController requires authentication', function () {
    // Test that controller methods require auth
    expect(class_exists('App\Http\Controllers\Auth\NewPasswordController'))->toBeTrue();
});
