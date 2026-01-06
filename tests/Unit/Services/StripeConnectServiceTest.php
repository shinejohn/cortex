<?php

use App\Services\StripeConnectService;

test('StripeConnectService can be instantiated', function () {
    $service = app(StripeConnectService::class);
    expect($service)->toBeInstanceOf(StripeConnectService::class);
});
