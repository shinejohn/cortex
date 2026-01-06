<?php

use App\Models\BusinessSurveyResponse;

test('can create BusinessSurveyResponse', function () {
    $model = BusinessSurveyResponse::factory()->create();
    expect($model)->toBeInstanceOf(BusinessSurveyResponse::class);
    expect($model->id)->toBeString();
});

test('BusinessSurveyResponse has required attributes', function () {
    $model = BusinessSurveyResponse::factory()->create();
    expect($model->id)->toBeString();
    expect($model->created_at)->not->toBeNull();
});

test('BusinessSurveyResponse can be updated', function () {
    $model = BusinessSurveyResponse::factory()->create();
    $originalUpdated = $model->updated_at;
    
    sleep(1);
    $model->touch();
    
    expect($model->updated_at)->not->toBe($originalUpdated);
});
