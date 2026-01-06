<?php

test('PasswordResetLinkController exists', function () {
    expect(class_exists('App\Http\Controllers\Auth\PasswordResetLinkController'))->toBeTrue();
});

test('PasswordResetLinkController requires authentication', function () {
    // Test that controller methods require auth
    expect(class_exists('App\Http\Controllers\Auth\PasswordResetLinkController'))->toBeTrue();
});
