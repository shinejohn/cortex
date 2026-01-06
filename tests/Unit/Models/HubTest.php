<?php

use App\Models\Hub;

test('can create Hub', function () {
    $model = Hub::factory()->create();
    expect($model)->toBeInstanceOf(Hub::class);
    expect($model->id)->toBeString();
});

test('Hub has required attributes', function () {
    $model = Hub::factory()->create();
    expect($model->id)->toBeString();
    expect($model->created_at)->not->toBeNull();
});
