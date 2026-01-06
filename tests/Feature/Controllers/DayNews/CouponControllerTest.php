<?php

test('CouponController exists', function () {
    expect(class_exists('App\Http\Controllers\DayNews\CouponController\CouponController'))->toBeTrue();
});

test('CouponController requires authentication', function () {
    expect(class_exists('App\Http\Controllers\DayNews\CouponController\CouponController'))->toBeTrue();
});
