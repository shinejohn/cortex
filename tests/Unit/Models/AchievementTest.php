<?php

use App\Models\Achievement;

test('can create Achievement', function () {
    $model = Achievement::factory()->create();
    expect($model)->toBeInstanceOf(Achievement::class);
    expect($model->id)->toBeString();
});

test('Achievement has required attributes', function () {
    $model = Achievement::factory()->create();
    expect($model->id)->toBeString();
    expect($model->created_at)->not->toBeNull();
});

test('Achievement can be updated', function () {
    $model = Achievement::factory()->create();
    $originalUpdated = $model->updated_at;
    
    sleep(1);
    $model->touch();
    
    expect($model->updated_at)->not->toBe($originalUpdated);
});
