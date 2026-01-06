<?php

use App\Services\AlphaSite\SMBCrmService;

test('SMBCrmService can be instantiated', function () {
    $service = app(AlphaSite\SMBCrmService::class);
    expect($service)->toBeInstanceOf(AlphaSite\SMBCrmService::class);
});
