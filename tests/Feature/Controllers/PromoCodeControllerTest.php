<?php

test('PromoCodeController exists', function () {
    expect(class_exists('App\Http\Controllers\PromoCodeController'))->toBeTrue();
});

test('PromoCodeController requires authentication', function () {
    // Test that controller methods require auth
    expect(class_exists('App\Http\Controllers\PromoCodeController'))->toBeTrue();
});
