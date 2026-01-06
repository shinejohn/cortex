<?php

use App\Models\BusinessSurvey;

test('can create BusinessSurvey', function () {
    $model = BusinessSurvey::factory()->create();
    expect($model)->toBeInstanceOf(BusinessSurvey::class);
    expect($model->id)->toBeString();
});

test('BusinessSurvey has required attributes', function () {
    $model = BusinessSurvey::factory()->create();
    expect($model->id)->toBeString();
    expect($model->created_at)->not->toBeNull();
});

test('BusinessSurvey can be updated', function () {
    $model = BusinessSurvey::factory()->create();
    $originalUpdated = $model->updated_at;
    
    sleep(1);
    $model->touch();
    
    expect($model->updated_at)->not->toBe($originalUpdated);
});
