<?php

use App\Services\CheckInService;

test('CheckInService can be instantiated', function () {
    $service = app(App\Services\CheckInService::class);
    expect($service)->toBeInstanceOf(App\Services\CheckInService::class);
});
