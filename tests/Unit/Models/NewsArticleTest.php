<?php

use App\Models\NewsArticle;

test('can create NewsArticle', function () {
    $model = NewsArticle::factory()->create();
    expect($model)->toBeInstanceOf(NewsArticle::class);
});

test('NewsArticle has required attributes', function () {
    $model = NewsArticle::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
