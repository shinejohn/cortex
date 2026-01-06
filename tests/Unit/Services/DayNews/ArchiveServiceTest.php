<?php

use App\Services\DayNews\ArchiveService;

test('ArchiveService can be instantiated', function () {
    $service = app(DayNews\ArchiveService::class);
    expect($service)->toBeInstanceOf(DayNews\ArchiveService::class);
});
