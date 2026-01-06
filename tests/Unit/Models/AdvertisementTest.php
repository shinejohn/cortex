<?php

use App\Models\Advertisement;

test('can create Advertisement', function () {
    $model = Advertisement::factory()->create();
    expect($model)->toBeInstanceOf(Advertisement::class);
    expect($model->id)->toBeInt(); // Uses integer ID, not UUID
});

test('Advertisement has required attributes', function () {
    $model = Advertisement::factory()->create();
    expect($model->id)->toBeInt(); // Uses integer ID, not UUID
    expect($model->created_at)->not->toBeNull();
});

test('Advertisement can be updated', function () {
    $model = Advertisement::factory()->create();
    $originalUpdated = $model->updated_at;
    
    sleep(1);
    $model->touch();
    
    expect($model->updated_at)->not->toBe($originalUpdated);
});
