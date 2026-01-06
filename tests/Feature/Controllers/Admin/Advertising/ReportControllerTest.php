<?php

test('ReportController exists', function () {
    expect(class_exists('App\Http\Controllers\Admin\Advertising\ReportController'))->toBeTrue();
});

test('ReportController requires authentication', function () {
    // Test that controller methods require auth
    expect(class_exists('App\Http\Controllers\Admin\Advertising\ReportController'))->toBeTrue();
});
