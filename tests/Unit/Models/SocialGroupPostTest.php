<?php

use App\Models\SocialGroupPost;

test('can create SocialGroupPost', function () {
    $model = SocialGroupPost::factory()->create();
    expect($model)->toBeInstanceOf(SocialGroupPost::class);
});

test('SocialGroupPost has required attributes', function () {
    $model = SocialGroupPost::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
