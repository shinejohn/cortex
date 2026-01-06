<?php

use App\Models\AdCreative;

test('can create AdCreative', function () {
    $model = AdCreative::factory()->create();
    expect($model)->toBeInstanceOf(AdCreative::class);
    expect($model->id)->toBeInt(); // Uses integer ID, not UUID
});

test('AdCreative has required attributes', function () {
    $model = AdCreative::factory()->create();
    expect($model->id)->toBeInt(); // Uses integer ID, not UUID
    expect($model->created_at)->not->toBeNull();
});

test('AdCreative can be updated', function () {
    $model = AdCreative::factory()->create();
    $originalUpdated = $model->updated_at;
    
    sleep(1);
    $model->touch();
    
    expect($model->updated_at)->not->toBe($originalUpdated);
});
