<?php

use App\Models\NewsArticleDraft;

test('can create NewsArticleDraft', function () {
    $model = NewsArticleDraft::factory()->create();
    expect($model)->toBeInstanceOf(NewsArticleDraft::class);
});

test('NewsArticleDraft has required attributes', function () {
    $model = NewsArticleDraft::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
