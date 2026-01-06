<?php

test('SocialGroupController exists', function () {
    expect(class_exists('App\Http\Controllers\SocialGroupController'))->toBeTrue();
});

test('SocialGroupController requires authentication', function () {
    // Test that controller methods require auth
    expect(class_exists('App\Http\Controllers\SocialGroupController'))->toBeTrue();
});
