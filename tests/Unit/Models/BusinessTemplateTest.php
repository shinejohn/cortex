<?php

use App\Models\BusinessTemplate;

test('can create BusinessTemplate', function () {
    $model = BusinessTemplate::factory()->create();
    expect($model)->toBeInstanceOf(BusinessTemplate::class);
    expect($model->id)->toBeString();
});

test('BusinessTemplate has required attributes', function () {
    $model = BusinessTemplate::factory()->create();
    expect($model->id)->toBeString();
    expect($model->created_at)->not->toBeNull();
});

test('BusinessTemplate can be updated', function () {
    $model = BusinessTemplate::factory()->create();
    $originalUpdated = $model->updated_at;
    
    sleep(1);
    $model->touch();
    
    expect($model->updated_at)->not->toBe($originalUpdated);
});
