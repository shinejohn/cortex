<?php

use App\Models\TicketTransfer;

test('can create TicketTransfer', function () {
    $model = TicketTransfer::factory()->create();
    expect($model)->toBeInstanceOf(TicketTransfer::class);
});

test('TicketTransfer has required attributes', function () {
    $model = TicketTransfer::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
