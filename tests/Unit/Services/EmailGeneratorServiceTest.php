<?php

use App\Services\EmailGeneratorService;

test('EmailGeneratorService can be instantiated', function () {
    $service = app(App\Services\EmailGeneratorService::class);
    expect($service)->toBeInstanceOf(App\Services\EmailGeneratorService::class);
});
