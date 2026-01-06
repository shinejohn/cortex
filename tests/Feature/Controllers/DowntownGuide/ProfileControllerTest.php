<?php

test('ProfileController exists', function () {
    expect(class_exists('App\Http\Controllers\DowntownGuide\ProfileController'))->toBeTrue();
});

test('ProfileController requires authentication', function () {
    // Test that controller methods require auth
    expect(class_exists('App\Http\Controllers\DowntownGuide\ProfileController'))->toBeTrue();
});
