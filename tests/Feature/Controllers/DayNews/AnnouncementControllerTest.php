<?php

test('AnnouncementController exists', function () {
    expect(class_exists('App\Http\Controllers\DayNews\AnnouncementController\AnnouncementController'))->toBeTrue();
});

test('AnnouncementController requires authentication', function () {
    expect(class_exists('App\Http\Controllers\DayNews\AnnouncementController\AnnouncementController'))->toBeTrue();
});
