<?php

use App\Models\ClassifiedPayment;

test('can create ClassifiedPayment', function () {
    $model = ClassifiedPayment::factory()->create();
    expect($model)->toBeInstanceOf(ClassifiedPayment::class);
    expect($model->id)->toBeInt(); // Uses integer ID, not UUID
});

test('ClassifiedPayment has required attributes', function () {
    $model = ClassifiedPayment::factory()->create();
    expect($model->id)->toBeInt(); // Uses integer ID, not UUID
    expect($model->created_at)->not->toBeNull();
});

test('ClassifiedPayment can be updated', function () {
    $model = ClassifiedPayment::factory()->create();
    $originalUpdated = $model->updated_at;
    
    sleep(1);
    $model->touch();
    
    expect($model->updated_at)->not->toBe($originalUpdated);
});
