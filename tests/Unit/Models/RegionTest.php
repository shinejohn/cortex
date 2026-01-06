<?php

use App\Models\Region;

test('can create Region', function () {
    $model = Region::factory()->create();
    expect($model)->toBeInstanceOf(Region::class);
});

test('Region has required attributes', function () {
    $model = Region::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
