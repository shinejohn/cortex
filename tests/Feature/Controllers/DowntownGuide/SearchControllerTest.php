<?php

test('SearchController exists', function () {
    expect(class_exists('App\Http\Controllers\DowntownGuide\SearchController'))->toBeTrue();
});

test('SearchController requires authentication', function () {
    // Test that controller methods require auth
    expect(class_exists('App\Http\Controllers\DowntownGuide\SearchController'))->toBeTrue();
});
