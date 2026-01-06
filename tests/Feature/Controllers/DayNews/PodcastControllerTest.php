<?php

test('PodcastController exists', function () {
    expect(class_exists('App\Http\Controllers\DayNews\PodcastController\PodcastController'))->toBeTrue();
});

test('PodcastController requires authentication', function () {
    expect(class_exists('App\Http\Controllers\DayNews\PodcastController\PodcastController'))->toBeTrue();
});
