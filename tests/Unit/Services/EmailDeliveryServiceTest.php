<?php

use App\Services\EmailDeliveryService;

test('EmailDeliveryService can be instantiated', function () {
    $service = app(App\Services\EmailDeliveryService::class);
    expect($service)->toBeInstanceOf(App\Services\EmailDeliveryService::class);
});
