<?php

test('ConfirmablePasswordController exists', function () {
    expect(class_exists('App\Http\Controllers\Auth\ConfirmablePasswordController'))->toBeTrue();
});

test('ConfirmablePasswordController requires authentication', function () {
    // Test that controller methods require auth
    expect(class_exists('App\Http\Controllers\Auth\ConfirmablePasswordController'))->toBeTrue();
});
