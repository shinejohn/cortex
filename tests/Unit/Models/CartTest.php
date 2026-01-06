<?php

use App\Models\Cart;

test('can create Cart', function () {
    $model = Cart::factory()->create();
    expect($model)->toBeInstanceOf(Cart::class);
    expect($model->id)->toBeString();
});

test('Cart has required attributes', function () {
    $model = Cart::factory()->create();
    expect($model->id)->toBeString();
    expect($model->created_at)->not->toBeNull();
});
