<?php

use App\Models\Order;

test('can create Order', function () {
    $model = Order::factory()->create();
    expect($model)->toBeInstanceOf(Order::class);
    expect($model->id)->toBeString();
});

test('Order has required attributes', function () {
    $model = Order::factory()->create();
    expect($model->id)->toBeString();
    expect($model->created_at)->not->toBeNull();
});
