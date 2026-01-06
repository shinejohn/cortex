<?php

use App\Models\Calendar;

test('can create Calendar', function () {
    $model = Calendar::factory()->create();
    expect($model)->toBeInstanceOf(Calendar::class);
    expect($model->id)->toBeString();
});

test('Calendar has required attributes', function () {
    $model = Calendar::factory()->create();
    expect($model->id)->toBeString();
    expect($model->created_at)->not->toBeNull();
});

test('Calendar can be updated', function () {
    $model = Calendar::factory()->create();
    $originalUpdated = $model->updated_at;
    
    sleep(1);
    $model->touch();
    
    expect($model->updated_at)->not->toBe($originalUpdated);
});
