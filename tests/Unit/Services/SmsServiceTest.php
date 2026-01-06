<?php

use App\Services\SmsService;

test('SmsService can be instantiated', function () {
    $service = app(App\Services\SmsService::class);
    expect($service)->toBeInstanceOf(App\Services\SmsService::class);
});
