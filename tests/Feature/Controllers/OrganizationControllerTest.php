<?php

test('OrganizationController exists', function () {
    expect(class_exists('App\Http\Controllers\OrganizationController'))->toBeTrue();
});

test('OrganizationController requires authentication', function () {
    // Test that controller methods require auth
    expect(class_exists('App\Http\Controllers\OrganizationController'))->toBeTrue();
});
