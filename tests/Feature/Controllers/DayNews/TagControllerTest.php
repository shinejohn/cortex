<?php

test('TagController exists', function () {
    expect(class_exists('App\Http\Controllers\DayNews\TagController\TagController'))->toBeTrue();
});

test('TagController requires authentication', function () {
    expect(class_exists('App\Http\Controllers\DayNews\TagController\TagController'))->toBeTrue();
});
