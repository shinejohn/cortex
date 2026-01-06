<?php

use App\Models\SearchHistory;

test('can create SearchHistory', function () {
    $model = SearchHistory::factory()->create();
    expect($model)->toBeInstanceOf(SearchHistory::class);
});

test('SearchHistory has required attributes', function () {
    $model = SearchHistory::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
