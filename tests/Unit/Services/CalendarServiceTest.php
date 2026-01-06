<?php

use App\Services\CalendarService;

test('CalendarService can be instantiated', function () {
    $service = app(App\Services\CalendarService::class);
    expect($service)->toBeInstanceOf(App\Services\CalendarService::class);
});
