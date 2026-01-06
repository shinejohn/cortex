<?php

use App\Models\RegionZipcode;

test('can create RegionZipcode', function () {
    $model = RegionZipcode::factory()->create();
    expect($model)->toBeInstanceOf(RegionZipcode::class);
});

test('RegionZipcode has required attributes', function () {
    $model = RegionZipcode::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
