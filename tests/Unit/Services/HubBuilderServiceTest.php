<?php

use App\Services\HubBuilderService;

test('HubBuilderService can be instantiated', function () {
    $service = app(App\Services\HubBuilderService::class);
    expect($service)->toBeInstanceOf(App\Services\HubBuilderService::class);
});
