<?php

use App\Services\PhoneVerificationService;

test('PhoneVerificationService can be instantiated', function () {
    $service = app(App\Services\PhoneVerificationService::class);
    expect($service)->toBeInstanceOf(App\Services\PhoneVerificationService::class);
});
