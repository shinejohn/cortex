<?php

use App\Services\BookingWorkflowService;

test('BookingWorkflowService can be instantiated', function () {
    $service = app(App\Services\BookingWorkflowService::class);
    expect($service)->toBeInstanceOf(App\Services\BookingWorkflowService::class);
});
