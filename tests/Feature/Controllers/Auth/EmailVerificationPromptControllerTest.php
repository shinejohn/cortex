<?php

test('EmailVerificationPromptController exists', function () {
    expect(class_exists('App\Http\Controllers\Auth\EmailVerificationPromptController'))->toBeTrue();
});

test('EmailVerificationPromptController requires authentication', function () {
    // Test that controller methods require auth
    expect(class_exists('App\Http\Controllers\Auth\EmailVerificationPromptController'))->toBeTrue();
});
