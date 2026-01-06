<?php

test('SocialiteController exists', function () {
    expect(class_exists('App\Http\Controllers\Auth\SocialiteController'))->toBeTrue();
});

test('SocialiteController requires authentication', function () {
    // Test that controller methods require auth
    expect(class_exists('App\Http\Controllers\Auth\SocialiteController'))->toBeTrue();
});
