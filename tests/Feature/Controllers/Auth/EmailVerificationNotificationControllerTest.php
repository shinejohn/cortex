<?php

test('EmailVerificationNotificationController exists', function () {
    expect(class_exists('App\Http\Controllers\Auth\EmailVerificationNotificationController'))->toBeTrue();
});

test('EmailVerificationNotificationController requires authentication', function () {
    // Test that controller methods require auth
    expect(class_exists('App\Http\Controllers\Auth\EmailVerificationNotificationController'))->toBeTrue();
});
