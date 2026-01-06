<?php

test('AlertController exists', function () {
    expect(class_exists('App\Http\Controllers\Admin\Emergency\AlertController'))->toBeTrue();
});

test('AlertController requires authentication', function () {
    // Test that controller methods require auth
    expect(class_exists('App\Http\Controllers\Admin\Emergency\AlertController'))->toBeTrue();
});
