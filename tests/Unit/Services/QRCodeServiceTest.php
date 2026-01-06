<?php

use App\Services\QRCodeService;

test('QRCodeService can be instantiated', function () {
    $service = app(App\Services\QRCodeService::class);
    expect($service)->toBeInstanceOf(App\Services\QRCodeService::class);
});
