<?php

use App\Models\OrderItem;

test('can create OrderItem', function () {
    $model = OrderItem::factory()->create();
    expect($model)->toBeInstanceOf(OrderItem::class);
});

test('OrderItem has required attributes', function () {
    $model = OrderItem::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
