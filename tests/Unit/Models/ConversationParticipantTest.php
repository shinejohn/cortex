<?php

use App\Models\ConversationParticipant;

test('can create ConversationParticipant', function () {
    $model = ConversationParticipant::factory()->create();
    expect($model)->toBeInstanceOf(ConversationParticipant::class);
    expect($model->id)->toBeString();
});

test('ConversationParticipant has required attributes', function () {
    $model = ConversationParticipant::factory()->create();
    expect($model->id)->toBeString();
    expect($model->created_at)->not->toBeNull();
});

test('ConversationParticipant can be updated', function () {
    $model = ConversationParticipant::factory()->create();
    $originalUpdated = $model->updated_at;
    
    sleep(1);
    $model->touch();
    
    expect($model->updated_at)->not->toBe($originalUpdated);
});
