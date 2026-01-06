<?php

use App\Models\CalendarFollower;

test('can create CalendarFollower', function () {
    $model = CalendarFollower::factory()->create();
    expect($model)->toBeInstanceOf(CalendarFollower::class);
    expect($model->id)->toBeInt(); // Uses integer ID, not UUID
});

test('CalendarFollower has required attributes', function () {
    $model = CalendarFollower::factory()->create();
    expect($model->id)->toBeInt(); // Uses integer ID, not UUID
    expect($model->created_at)->not->toBeNull();
});

test('CalendarFollower can be updated', function () {
    $model = CalendarFollower::factory()->create();
    $originalUpdated = $model->updated_at;
    
    sleep(1);
    $model->touch();
    
    expect($model->updated_at)->not->toBe($originalUpdated);
});
