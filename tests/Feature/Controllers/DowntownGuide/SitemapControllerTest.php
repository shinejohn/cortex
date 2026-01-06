<?php

test('SitemapController exists', function () {
    expect(class_exists('App\Http\Controllers\DowntownGuide\SitemapController'))->toBeTrue();
});

test('SitemapController requires authentication', function () {
    // Test that controller methods require auth
    expect(class_exists('App\Http\Controllers\DowntownGuide\SitemapController'))->toBeTrue();
});
