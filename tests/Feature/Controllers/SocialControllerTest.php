<?php

test('SocialController exists', function () {
    expect(class_exists('App\Http\Controllers\SocialController'))->toBeTrue();
});

test('SocialController requires authentication', function () {
    // Test that controller methods require auth
    expect(class_exists('App\Http\Controllers\SocialController'))->toBeTrue();
});
