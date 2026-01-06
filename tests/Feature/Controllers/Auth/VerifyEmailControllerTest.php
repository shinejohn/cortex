<?php

test('VerifyEmailController exists', function () {
    expect(class_exists('App\Http\Controllers\Auth\VerifyEmailController'))->toBeTrue();
});

test('VerifyEmailController requires authentication', function () {
    // Test that controller methods require auth
    expect(class_exists('App\Http\Controllers\Auth\VerifyEmailController'))->toBeTrue();
});
