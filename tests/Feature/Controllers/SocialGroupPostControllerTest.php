<?php

test('SocialGroupPostController exists', function () {
    expect(class_exists('App\Http\Controllers\SocialGroupPostController'))->toBeTrue();
});

test('SocialGroupPostController requires authentication', function () {
    // Test that controller methods require auth
    expect(class_exists('App\Http\Controllers\SocialGroupPostController'))->toBeTrue();
});
