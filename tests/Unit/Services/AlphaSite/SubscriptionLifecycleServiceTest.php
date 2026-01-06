<?php

use App\Services\AlphaSite\SubscriptionLifecycleService;

test('SubscriptionLifecycleService can be instantiated', function () {
    $service = app(AlphaSite\SubscriptionLifecycleService::class);
    expect($service)->toBeInstanceOf(AlphaSite\SubscriptionLifecycleService::class);
});
