<?php

use App\Models\WriterAgent;

test('can create WriterAgent', function () {
    $model = WriterAgent::factory()->create();
    expect($model)->toBeInstanceOf(WriterAgent::class);
});

test('WriterAgent has required attributes', function () {
    $model = WriterAgent::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
