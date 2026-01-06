<?php

use App\Services\EmergencyBroadcastService;

test('EmergencyBroadcastService can be instantiated', function () {
    $service = app(App\Services\EmergencyBroadcastService::class);
    expect($service)->toBeInstanceOf(App\Services\EmergencyBroadcastService::class);
});
