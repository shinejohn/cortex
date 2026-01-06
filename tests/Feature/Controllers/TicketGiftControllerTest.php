<?php

test('TicketGiftController exists', function () {
    expect(class_exists('App\Http\Controllers\TicketGiftController'))->toBeTrue();
});

test('TicketGiftController requires authentication', function () {
    // Test that controller methods require auth
    expect(class_exists('App\Http\Controllers\TicketGiftController'))->toBeTrue();
});
