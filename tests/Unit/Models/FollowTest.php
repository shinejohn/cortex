<?php

use App\Models\Follow;

test('can create Follow', function () {
    $model = Follow::factory()->create();
    expect($model)->toBeInstanceOf(Follow::class);
});

test('Follow has required attributes', function () {
    $model = Follow::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
