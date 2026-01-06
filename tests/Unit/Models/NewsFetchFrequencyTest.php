<?php

use App\Models\NewsFetchFrequency;

test('can create NewsFetchFrequency', function () {
    $model = NewsFetchFrequency::factory()->create();
    expect($model)->toBeInstanceOf(NewsFetchFrequency::class);
});

test('NewsFetchFrequency has required attributes', function () {
    $model = NewsFetchFrequency::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
