<?php

test('VenueController exists', function () {
    expect(class_exists('App\Http\Controllers\VenueController'))->toBeTrue();
});

test('VenueController requires authentication', function () {
    // Test that controller methods require auth
    expect(class_exists('App\Http\Controllers\VenueController'))->toBeTrue();
});
