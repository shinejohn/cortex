<?php

use App\Models\Photo;

test('can create Photo', function () {
    $model = Photo::factory()->create();
    expect($model)->toBeInstanceOf(Photo::class);
    expect($model->id)->toBeString();
});

test('Photo has required attributes', function () {
    $model = Photo::factory()->create();
    expect($model->id)->toBeString();
    expect($model->created_at)->not->toBeNull();
});
