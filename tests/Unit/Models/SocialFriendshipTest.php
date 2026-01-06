<?php

use App\Models\SocialFriendship;

test('can create SocialFriendship', function () {
    $model = SocialFriendship::factory()->create();
    expect($model)->toBeInstanceOf(SocialFriendship::class);
});

test('SocialFriendship has required attributes', function () {
    $model = SocialFriendship::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
