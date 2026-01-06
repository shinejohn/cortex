<?php

use App\Services\AlphaSite\LinkingService;

test('LinkingService can be instantiated', function () {
    $service = app(AlphaSite\LinkingService::class);
    expect($service)->toBeInstanceOf(AlphaSite\LinkingService::class);
});
