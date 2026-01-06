<?php

use App\Services\LoyaltyService;

test('LoyaltyService can be instantiated', function () {
    $service = app(LoyaltyService::class);
    expect($service)->toBeInstanceOf(LoyaltyService::class);
});
