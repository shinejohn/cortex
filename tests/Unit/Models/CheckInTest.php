<?php

use App\Models\CheckIn;

test('can create CheckIn', function () {
    $model = CheckIn::factory()->create();
    expect($model)->toBeInstanceOf(CheckIn::class);
    expect($model->id)->toBeString();
});

test('CheckIn has required attributes', function () {
    $model = CheckIn::factory()->create();
    expect($model->id)->toBeString();
    expect($model->created_at)->not->toBeNull();
});
