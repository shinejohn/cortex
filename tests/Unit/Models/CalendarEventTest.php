<?php

use App\Models\CalendarEvent;

test('can create CalendarEvent', function () {
    $model = CalendarEvent::factory()->create();
    expect($model)->toBeInstanceOf(CalendarEvent::class);
    expect($model->id)->toBeInt(); // Uses integer ID, not UUID
});

test('CalendarEvent has required attributes', function () {
    $model = CalendarEvent::factory()->create();
    expect($model->id)->toBeInt(); // Uses integer ID, not UUID
    expect($model->created_at)->not->toBeNull();
});

test('CalendarEvent can be updated', function () {
    $model = CalendarEvent::factory()->create();
    $originalUpdated = $model->updated_at;
    
    sleep(1);
    $model->touch();
    
    expect($model->updated_at)->not->toBe($originalUpdated);
});
