<?php

use App\Models\EventExtractionDraft;

test('can create EventExtractionDraft', function () {
    $model = EventExtractionDraft::factory()->create();
    expect($model)->toBeInstanceOf(EventExtractionDraft::class);
});

test('EventExtractionDraft has required attributes', function () {
    $model = EventExtractionDraft::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
