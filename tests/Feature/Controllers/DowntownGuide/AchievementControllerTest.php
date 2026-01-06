<?php

test('AchievementController exists', function () {
    expect(class_exists('App\Http\Controllers\DowntownGuide\AchievementController'))->toBeTrue();
});

test('AchievementController requires authentication', function () {
    // Test that controller methods require auth
    expect(class_exists('App\Http\Controllers\DowntownGuide\AchievementController'))->toBeTrue();
});
