<?php

use App\Models\Podcast;

test('can create Podcast', function () {
    $model = Podcast::factory()->create();
    expect($model)->toBeInstanceOf(Podcast::class);
    expect($model->id)->toBeString();
});

test('Podcast has required attributes', function () {
    $model = Podcast::factory()->create();
    expect($model->id)->toBeString();
    expect($model->created_at)->not->toBeNull();
});
