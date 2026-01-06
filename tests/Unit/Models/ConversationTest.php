<?php

use App\Models\Conversation;

test('can create Conversation', function () {
    $model = Conversation::factory()->create();
    expect($model)->toBeInstanceOf(Conversation::class);
    expect($model->id)->toBeString();
});

test('Conversation has required attributes', function () {
    $model = Conversation::factory()->create();
    expect($model->id)->toBeString();
    expect($model->created_at)->not->toBeNull();
});
