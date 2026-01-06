<?php

use App\Models\AdPlacement;

test('can create AdPlacement', function () {
    $model = AdPlacement::factory()->create();
    expect($model)->toBeInstanceOf(AdPlacement::class);
    expect($model->id)->toBeInt(); // Uses integer ID, not UUID
});

test('AdPlacement has required attributes', function () {
    $model = AdPlacement::factory()->create();
    expect($model->id)->toBeInt(); // Uses integer ID, not UUID
    expect($model->created_at)->not->toBeNull();
});

test('AdPlacement can be updated', function () {
    $model = AdPlacement::factory()->create();
    $originalUpdated = $model->updated_at;
    
    sleep(1);
    $model->touch();
    
    expect($model->updated_at)->not->toBe($originalUpdated);
});
