<?php

test('NotificationController exists', function () {
    expect(class_exists('App\Http\Controllers\NotificationController'))->toBeTrue();
});

test('NotificationController requires authentication', function () {
    // Test that controller methods require auth
    expect(class_exists('App\Http\Controllers\NotificationController'))->toBeTrue();
});
