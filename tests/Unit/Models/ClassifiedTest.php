<?php

use App\Models\Classified;

test('can create Classified', function () {
    $model = Classified::factory()->create();
    expect($model)->toBeInstanceOf(Classified::class);
    expect($model->id)->toBeString();
});

test('Classified has required attributes', function () {
    $model = Classified::factory()->create();
    expect($model->id)->toBeString();
    expect($model->created_at)->not->toBeNull();
});
