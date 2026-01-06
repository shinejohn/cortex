<?php

use App\Models\AlphaSiteCommunity;

test('can create AlphaSiteCommunity', function () {
    $model = AlphaSiteCommunity::factory()->create();
    expect($model)->toBeInstanceOf(AlphaSiteCommunity::class);
    expect($model->id)->toBeString();
});

test('AlphaSiteCommunity has required attributes', function () {
    $model = AlphaSiteCommunity::factory()->create();
    expect($model->id)->toBeString();
    expect($model->created_at)->not->toBeNull();
});

test('AlphaSiteCommunity can be updated', function () {
    $model = AlphaSiteCommunity::factory()->create();
    $originalUpdated = $model->updated_at;
    
    sleep(1);
    $model->touch();
    
    expect($model->updated_at)->not->toBe($originalUpdated);
});
