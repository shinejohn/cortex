<?php

use App\Models\CalendarRole;

test('can create CalendarRole', function () {
    $model = CalendarRole::factory()->create();
    expect($model)->toBeInstanceOf(CalendarRole::class);
    expect($model->id)->toBeInt(); // Uses integer ID, not UUID
});

test('CalendarRole has required attributes', function () {
    $model = CalendarRole::factory()->create();
    expect($model->id)->toBeInt(); // Uses integer ID, not UUID
    expect($model->created_at)->not->toBeNull();
});

test('CalendarRole can be updated', function () {
    $model = CalendarRole::factory()->create();
    $originalUpdated = $model->updated_at;
    
    sleep(1);
    $model->touch();
    
    expect($model->updated_at)->not->toBe($originalUpdated);
});
