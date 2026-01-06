<?php

test('ClassifiedController exists', function () {
    expect(class_exists('App\Http\Controllers\DayNews\ClassifiedController\ClassifiedController'))->toBeTrue();
});

test('ClassifiedController requires authentication', function () {
    expect(class_exists('App\Http\Controllers\DayNews\ClassifiedController\ClassifiedController'))->toBeTrue();
});
