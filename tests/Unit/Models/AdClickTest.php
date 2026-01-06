<?php

use App\Models\AdClick;

test('can create AdClick', function () {
    $model = AdClick::factory()->create();
    expect($model)->toBeInstanceOf(AdClick::class);
    expect($model->id)->toBeInt(); // Uses integer ID, not UUID
});

test('AdClick has required attributes', function () {
    $model = AdClick::factory()->create();
    expect($model->id)->toBeInt(); // Uses integer ID, not UUID
    expect($model->created_at)->not->toBeNull();
});

test('AdClick can be updated', function () {
    $model = AdClick::factory()->create();
    $originalUpdated = $model->updated_at;
    
    sleep(1);
    $model->touch();
    
    expect($model->updated_at)->not->toBe($originalUpdated);
});
