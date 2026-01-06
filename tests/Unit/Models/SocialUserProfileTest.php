<?php

use App\Models\SocialUserProfile;

test('can create SocialUserProfile', function () {
    $model = SocialUserProfile::factory()->create();
    expect($model)->toBeInstanceOf(SocialUserProfile::class);
});

test('SocialUserProfile has required attributes', function () {
    $model = SocialUserProfile::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
