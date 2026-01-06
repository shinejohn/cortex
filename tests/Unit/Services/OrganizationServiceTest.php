<?php

use App\Services\OrganizationService;

test('OrganizationService can be instantiated', function () {
    $service = app(App\Services\OrganizationService::class);
    expect($service)->toBeInstanceOf(App\Services\OrganizationService::class);
});
