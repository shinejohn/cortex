<?php

use App\Services\DayNews\AnnouncementService\AnnouncementService;

test('AnnouncementService can be instantiated', function () {
    $service = app(App\Services\DayNews\AnnouncementService\AnnouncementService::class);
    expect($service)->toBeInstanceOf(App\Services\DayNews\AnnouncementService\AnnouncementService::class);
});
