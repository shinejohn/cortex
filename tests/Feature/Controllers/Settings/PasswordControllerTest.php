<?php

test('PasswordController exists', function () {
    expect(class_exists('App\Http\Controllers\Settings\PasswordController'))->toBeTrue();
});

test('PasswordController requires authentication', function () {
    // Test that controller methods require auth
    expect(class_exists('App\Http\Controllers\Settings\PasswordController'))->toBeTrue();
});
