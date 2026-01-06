<?php

use App\Models\HubSection;

test('can create HubSection', function () {
    $model = HubSection::factory()->create();
    expect($model)->toBeInstanceOf(HubSection::class);
});

test('HubSection has required attributes', function () {
    $model = HubSection::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
