<?php

use App\Models\TicketGift;

test('can create TicketGift', function () {
    $model = TicketGift::factory()->create();
    expect($model)->toBeInstanceOf(TicketGift::class);
});

test('TicketGift has required attributes', function () {
    $model = TicketGift::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
