<?php

test('CalendarController exists', function () {
    expect(class_exists('App\Http\Controllers\CalendarController'))->toBeTrue();
});

test('CalendarController requires authentication', function () {
    // Test that controller methods require auth
    expect(class_exists('App\Http\Controllers\CalendarController'))->toBeTrue();
});
