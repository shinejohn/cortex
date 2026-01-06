<?php

use App\Models\BusinessSubscription;

test('can create BusinessSubscription', function () {
    $model = BusinessSubscription::factory()->create();
    expect($model)->toBeInstanceOf(BusinessSubscription::class);
    expect($model->id)->toBeString();
});

test('BusinessSubscription has required attributes', function () {
    $model = BusinessSubscription::factory()->create();
    expect($model->id)->toBeString();
    expect($model->created_at)->not->toBeNull();
});

test('BusinessSubscription can be updated', function () {
    $model = BusinessSubscription::factory()->create();
    $originalUpdated = $model->updated_at;
    
    sleep(1);
    $model->touch();
    
    expect($model->updated_at)->not->toBe($originalUpdated);
});
