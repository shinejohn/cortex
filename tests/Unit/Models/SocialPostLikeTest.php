<?php

use App\Models\SocialPostLike;

test('can create SocialPostLike', function () {
    $model = SocialPostLike::factory()->create();
    expect($model)->toBeInstanceOf(SocialPostLike::class);
});

test('SocialPostLike has required attributes', function () {
    $model = SocialPostLike::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
