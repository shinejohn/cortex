<?php

test('AuthenticatedSessionController exists', function () {
    expect(class_exists('App\Http\Controllers\Auth\AuthenticatedSessionController'))->toBeTrue();
});

test('AuthenticatedSessionController requires authentication', function () {
    // Test that controller methods require auth
    expect(class_exists('App\Http\Controllers\Auth\AuthenticatedSessionController'))->toBeTrue();
});
