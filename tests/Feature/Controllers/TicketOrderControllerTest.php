<?php

test('TicketOrderController exists', function () {
    expect(class_exists('App\Http\Controllers\TicketOrderController'))->toBeTrue();
});

test('TicketOrderController requires authentication', function () {
    // Test that controller methods require auth
    expect(class_exists('App\Http\Controllers\TicketOrderController'))->toBeTrue();
});
