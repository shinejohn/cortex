<?php

use App\Services\DayNewsPaymentService;

test('DayNewsPaymentService can be instantiated', function () {
    $service = app(App\Services\DayNewsPaymentService::class);
    expect($service)->toBeInstanceOf(App\Services\DayNewsPaymentService::class);
});
