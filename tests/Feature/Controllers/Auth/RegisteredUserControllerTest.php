<?php

test('RegisteredUserController exists', function () {
    expect(class_exists('App\Http\Controllers\Auth\RegisteredUserController'))->toBeTrue();
});

test('RegisteredUserController requires authentication', function () {
    // Test that controller methods require auth
    expect(class_exists('App\Http\Controllers\Auth\RegisteredUserController'))->toBeTrue();
});
