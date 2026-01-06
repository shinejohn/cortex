<?php

use App\Services\TicketMarketplaceService;

test('TicketMarketplaceService can be instantiated', function () {
    $service = app(App\Services\TicketMarketplaceService::class);
    expect($service)->toBeInstanceOf(App\Services\TicketMarketplaceService::class);
});
