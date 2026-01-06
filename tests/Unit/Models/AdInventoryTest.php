<?php

use App\Models\AdInventory;

test('can create AdInventory', function () {
    $model = AdInventory::factory()->create();
    expect($model)->toBeInstanceOf(AdInventory::class);
    expect($model->id)->toBeInt(); // Uses integer ID, not UUID
});

test('AdInventory has required attributes', function () {
    $model = AdInventory::factory()->create();
    expect($model->id)->toBeInt(); // Uses integer ID, not UUID
    expect($model->created_at)->not->toBeNull();
});

test('AdInventory can be updated', function () {
    $model = AdInventory::factory()->create();
    $originalUpdated = $model->updated_at;
    
    sleep(1);
    $model->touch();
    
    expect($model->updated_at)->not->toBe($originalUpdated);
});
