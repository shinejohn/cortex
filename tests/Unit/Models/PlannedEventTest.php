<?php

use App\Models\PlannedEvent;

test('can create PlannedEvent', function () {
    $model = PlannedEvent::factory()->create();
    expect($model)->toBeInstanceOf(PlannedEvent::class);
});

test('PlannedEvent has required attributes', function () {
    $model = PlannedEvent::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
