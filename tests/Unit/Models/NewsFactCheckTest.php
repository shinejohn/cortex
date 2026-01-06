<?php

use App\Models\NewsFactCheck;

test('can create NewsFactCheck', function () {
    $model = NewsFactCheck::factory()->create();
    expect($model)->toBeInstanceOf(NewsFactCheck::class);
});

test('NewsFactCheck has required attributes', function () {
    $model = NewsFactCheck::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
