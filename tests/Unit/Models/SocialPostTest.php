<?php

use App\Models\SocialPost;

test('can create SocialPost', function () {
    $model = SocialPost::factory()->create();
    expect($model)->toBeInstanceOf(SocialPost::class);
    expect($model->id)->toBeString();
});

test('SocialPost has required attributes', function () {
    $model = SocialPost::factory()->create();
    expect($model->id)->toBeString();
    expect($model->created_at)->not->toBeNull();
});
