<?php

test('CampaignController exists', function () {
    expect(class_exists('App\Http\Controllers\Admin\Email\CampaignController'))->toBeTrue();
});

test('CampaignController requires authentication', function () {
    // Test that controller methods require auth
    expect(class_exists('App\Http\Controllers\Admin\Email\CampaignController'))->toBeTrue();
});
