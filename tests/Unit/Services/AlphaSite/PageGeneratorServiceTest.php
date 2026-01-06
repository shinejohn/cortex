<?php

use App\Services\AlphaSite\PageGeneratorService;

test('PageGeneratorService can be instantiated', function () {
    $service = app(AlphaSite\PageGeneratorService::class);
    expect($service)->toBeInstanceOf(AlphaSite\PageGeneratorService::class);
});
