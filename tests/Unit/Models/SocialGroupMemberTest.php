<?php

use App\Models\SocialGroupMember;

test('can create SocialGroupMember', function () {
    $model = SocialGroupMember::factory()->create();
    expect($model)->toBeInstanceOf(SocialGroupMember::class);
});

test('SocialGroupMember has required attributes', function () {
    $model = SocialGroupMember::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
