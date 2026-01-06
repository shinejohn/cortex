<?php

use App\Services\TicketTransferService;

test('TicketTransferService can be instantiated', function () {
    $service = app(App\Services\TicketTransferService::class);
    expect($service)->toBeInstanceOf(App\Services\TicketTransferService::class);
});
