<?php

use App\Models\BusinessFaq;

test('can create BusinessFaq', function () {
    $model = BusinessFaq::factory()->create();
    expect($model)->toBeInstanceOf(BusinessFaq::class);
    expect($model->id)->toBeString();
});

test('BusinessFaq has required attributes', function () {
    $model = BusinessFaq::factory()->create();
    expect($model->id)->toBeString();
    expect($model->created_at)->not->toBeNull();
});

test('BusinessFaq can be updated', function () {
    $model = BusinessFaq::factory()->create();
    $originalUpdated = $model->updated_at;
    
    sleep(1);
    $model->touch();
    
    expect($model->updated_at)->not->toBe($originalUpdated);
});
