<?php

use App\Models\HubRole;

test('can create HubRole', function () {
    $model = HubRole::factory()->create();
    expect($model)->toBeInstanceOf(HubRole::class);
});

test('HubRole has required attributes', function () {
    $model = HubRole::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
