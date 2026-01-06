<?php

use App\Models\Tag;

test('can create Tag', function () {
    $model = Tag::factory()->create();
    expect($model)->toBeInstanceOf(Tag::class);
    expect($model->id)->toBeString();
});

test('Tag has required attributes', function () {
    $model = Tag::factory()->create();
    expect($model->id)->toBeString();
    expect($model->created_at)->not->toBeNull();
});
