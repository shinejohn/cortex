<?php

use App\Services\PromoCodeService;

test('PromoCodeService can be instantiated', function () {
    $service = app(App\Services\PromoCodeService::class);
    expect($service)->toBeInstanceOf(App\Services\PromoCodeService::class);
});
