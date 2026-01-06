<?php

use App\Services\NotificationIntegrationService;

test('NotificationIntegrationService can be instantiated', function () {
    $service = app(App\Services\NotificationIntegrationService::class);
    expect($service)->toBeInstanceOf(App\Services\NotificationIntegrationService::class);
});
