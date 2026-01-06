<?php

use App\Models\Industry;

test('can create Industry', function () {
    $model = Industry::factory()->create();
    expect($model)->toBeInstanceOf(Industry::class);
});

test('Industry has required attributes', function () {
    $model = Industry::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
