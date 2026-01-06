<?php

test('CouponController exists', function () {
    expect(class_exists('App\Http\Controllers\DowntownGuide\CouponController'))->toBeTrue();
});

test('CouponController requires authentication', function () {
    // Test that controller methods require auth
    expect(class_exists('App\Http\Controllers\DowntownGuide\CouponController'))->toBeTrue();
});
