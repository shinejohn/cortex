<?php

use App\Models\CreatorProfile;

test('can create CreatorProfile', function () {
    $model = CreatorProfile::factory()->create();
    expect($model)->toBeInstanceOf(CreatorProfile::class);
});

test('CreatorProfile has required attributes', function () {
    $model = CreatorProfile::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
