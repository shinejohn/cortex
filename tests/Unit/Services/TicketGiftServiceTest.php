<?php

use App\Services\TicketGiftService;

test('TicketGiftService can be instantiated', function () {
    $service = app(App\Services\TicketGiftService::class);
    expect($service)->toBeInstanceOf(App\Services\TicketGiftService::class);
});
