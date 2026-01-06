<?php

use App\Services\CrossDomainAuthService;

test('CrossDomainAuthService can be instantiated', function () {
    $service = app(App\Services\CrossDomainAuthService::class);
    expect($service)->toBeInstanceOf(App\Services\CrossDomainAuthService::class);
});
