<?php

use App\Models\SocialPostComment;

test('can create SocialPostComment', function () {
    $model = SocialPostComment::factory()->create();
    expect($model)->toBeInstanceOf(SocialPostComment::class);
});

test('SocialPostComment has required attributes', function () {
    $model = SocialPostComment::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
