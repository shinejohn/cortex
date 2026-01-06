<?php

use App\Services\DayNews\AuthorService;

test('AuthorService can be instantiated', function () {
    $service = app(DayNews\AuthorService::class);
    expect($service)->toBeInstanceOf(DayNews\AuthorService::class);
});
