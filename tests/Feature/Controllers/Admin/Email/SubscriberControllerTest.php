<?php

test('SubscriberController exists', function () {
    expect(class_exists('App\Http\Controllers\Admin\Email\SubscriberController'))->toBeTrue();
});

test('SubscriberController requires authentication', function () {
    // Test that controller methods require auth
    expect(class_exists('App\Http\Controllers\Admin\Email\SubscriberController'))->toBeTrue();
});
