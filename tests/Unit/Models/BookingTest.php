<?php

use App\Models\Booking;

test('can create Booking', function () {
    $model = Booking::factory()->create();
    expect($model)->toBeInstanceOf(Booking::class);
    expect($model->id)->toBeString();
});

test('Booking has required attributes', function () {
    $model = Booking::factory()->create();
    expect($model->id)->toBeString();
    expect($model->created_at)->not->toBeNull();
});

test('Booking can be updated', function () {
    $model = Booking::factory()->create();
    $originalUpdated = $model->updated_at;
    
    sleep(1);
    $model->touch();
    
    expect($model->updated_at)->not->toBe($originalUpdated);
});
