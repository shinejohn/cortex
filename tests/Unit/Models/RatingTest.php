<?php

use App\Models\Rating;

test('can create Rating', function () {
    $model = Rating::factory()->create();
    expect($model)->toBeInstanceOf(Rating::class);
});

test('Rating has required attributes', function () {
    $model = Rating::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
