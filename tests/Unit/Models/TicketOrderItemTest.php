<?php

use App\Models\TicketOrderItem;

test('can create TicketOrderItem', function () {
    $model = TicketOrderItem::factory()->create();
    expect($model)->toBeInstanceOf(TicketOrderItem::class);
    expect($model->id)->toBeString();
});

test('TicketOrderItem has required attributes', function () {
    $model = TicketOrderItem::factory()->create();
    expect($model->id)->toBeString();
    expect($model->created_at)->not->toBeNull();
});
