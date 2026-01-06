<?php

use App\Models\AdImpression;

test('can create AdImpression', function () {
    $model = AdImpression::factory()->create();
    expect($model)->toBeInstanceOf(AdImpression::class);
    expect($model->id)->toBeInt(); // Uses integer ID, not UUID
});

test('AdImpression has required attributes', function () {
    $model = AdImpression::factory()->create();
    expect($model->id)->toBeInt(); // Uses integer ID, not UUID
    expect($model->created_at)->not->toBeNull();
});

test('AdImpression can be updated', function () {
    $model = AdImpression::factory()->create();
    $originalUpdated = $model->updated_at;
    
    sleep(1);
    $model->touch();
    
    expect($model->updated_at)->not->toBe($originalUpdated);
});
