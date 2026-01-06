<?php

use App\Models\SocialUserFollow;

test('can create SocialUserFollow', function () {
    $model = SocialUserFollow::factory()->create();
    expect($model)->toBeInstanceOf(SocialUserFollow::class);
});

test('SocialUserFollow has required attributes', function () {
    $model = SocialUserFollow::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
