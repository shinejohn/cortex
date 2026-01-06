<?php

use App\Models\CartItem;

test('can create CartItem', function () {
    $model = CartItem::factory()->create();
    expect($model)->toBeInstanceOf(CartItem::class);
    expect($model->id)->toBeString();
});

test('CartItem has required attributes', function () {
    $model = CartItem::factory()->create();
    expect($model->id)->toBeString();
    expect($model->created_at)->not->toBeNull();
});

test('CartItem can be updated', function () {
    $model = CartItem::factory()->create();
    $originalUpdated = $model->updated_at;
    
    sleep(1);
    $model->touch();
    
    expect($model->updated_at)->not->toBe($originalUpdated);
});
