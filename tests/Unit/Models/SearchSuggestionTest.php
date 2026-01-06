<?php

use App\Models\SearchSuggestion;

test('can create SearchSuggestion', function () {
    $model = SearchSuggestion::factory()->create();
    expect($model)->toBeInstanceOf(SearchSuggestion::class);
});

test('SearchSuggestion has required attributes', function () {
    $model = SearchSuggestion::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
