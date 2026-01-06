<?php

use App\Models\Memorial;

test('can create Memorial', function () {
    $model = Memorial::factory()->create();
    expect($model)->toBeInstanceOf(Memorial::class);
    expect($model->id)->toBeString();
});

test('Memorial has required attributes', function () {
    $model = Memorial::factory()->create();
    expect($model->id)->toBeString();
    expect($model->created_at)->not->toBeNull();
});
