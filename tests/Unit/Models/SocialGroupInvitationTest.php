<?php

use App\Models\SocialGroupInvitation;

test('can create SocialGroupInvitation', function () {
    $model = SocialGroupInvitation::factory()->create();
    expect($model)->toBeInstanceOf(SocialGroupInvitation::class);
});

test('SocialGroupInvitation has required attributes', function () {
    $model = SocialGroupInvitation::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
