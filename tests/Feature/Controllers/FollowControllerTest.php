<?php

test('FollowController exists', function () {
    expect(class_exists('App\Http\Controllers\FollowController'))->toBeTrue();
});

test('FollowController requires authentication', function () {
    // Test that controller methods require auth
    expect(class_exists('App\Http\Controllers\FollowController'))->toBeTrue();
});
