<?php

use App\Models\ClassifiedImage;

test('can create ClassifiedImage', function () {
    $model = ClassifiedImage::factory()->create();
    expect($model)->toBeInstanceOf(ClassifiedImage::class);
    expect($model->id)->toBeInt(); // Uses integer ID, not UUID
});

test('ClassifiedImage has required attributes', function () {
    $model = ClassifiedImage::factory()->create();
    expect($model->id)->toBeInt(); // Uses integer ID, not UUID
    expect($model->created_at)->not->toBeNull();
});

test('ClassifiedImage can be updated', function () {
    $model = ClassifiedImage::factory()->create();
    $originalUpdated = $model->updated_at;
    
    sleep(1);
    $model->touch();
    
    expect($model->updated_at)->not->toBe($originalUpdated);
});
