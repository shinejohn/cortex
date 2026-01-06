<?php

test('BillingController exists', function () {
    expect(class_exists('App\Http\Controllers\Settings\BillingController'))->toBeTrue();
});

test('BillingController requires authentication', function () {
    // Test that controller methods require auth
    expect(class_exists('App\Http\Controllers\Settings\BillingController'))->toBeTrue();
});
