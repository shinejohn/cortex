<?php

use App\Services\DayNews\TagService\TagService;

test('TagService can be instantiated', function () {
    $service = app(App\Services\DayNews\TagService\TagService::class);
    expect($service)->toBeInstanceOf(App\Services\DayNews\TagService\TagService::class);
});
