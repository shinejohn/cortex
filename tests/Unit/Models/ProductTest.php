<?php

use App\Models\Product;

test('can create Product', function () {
    $model = Product::factory()->create();
    expect($model)->toBeInstanceOf(Product::class);
    expect($model->id)->toBeString();
});

test('Product has required attributes', function () {
    $model = Product::factory()->create();
    expect($model->id)->toBeString();
    expect($model->created_at)->not->toBeNull();
});
