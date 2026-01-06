<?php

use App\Services\HubService;

test('HubService can be instantiated', function () {
    $service = app(App\Services\HubService::class);
    expect($service)->toBeInstanceOf(App\Services\HubService::class);
});
