<?php

use App\Models\Message;

test('can create Message', function () {
    $model = Message::factory()->create();
    expect($model)->toBeInstanceOf(Message::class);
    expect($model->id)->toBeString();
});

test('Message has required attributes', function () {
    $model = Message::factory()->create();
    expect($model->id)->toBeString();
    expect($model->created_at)->not->toBeNull();
});
