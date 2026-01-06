<?php

use App\Services\ReferralService;

test('ReferralService can be instantiated', function () {
    $service = app(ReferralService::class);
    expect($service)->toBeInstanceOf(ReferralService::class);
});
