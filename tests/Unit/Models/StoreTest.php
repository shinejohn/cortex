<?php

use App\Models\Store;

test('can create Store', function () {
    $model = Store::factory()->create();
    expect($model)->toBeInstanceOf(Store::class);
    expect($model->id)->toBeString();
});

test('Store has required attributes', function () {
    $model = Store::factory()->create();
    expect($model->id)->toBeString();
    expect($model->created_at)->not->toBeNull();
});
