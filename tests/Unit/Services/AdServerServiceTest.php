<?php

use App\Services\AdServerService;

test('AdServerService can be instantiated', function () {
    $service = app(App\Services\AdServerService::class);
    expect($service)->toBeInstanceOf(App\Services\AdServerService::class);
});
