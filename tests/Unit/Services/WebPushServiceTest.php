<?php

use App\Services\WebPushService;

test('WebPushService can be instantiated', function () {
    $service = app(App\Services\WebPushService::class);
    expect($service)->toBeInstanceOf(App\Services\WebPushService::class);
});
