<?php

use App\Models\SocialAccount;

test('can create SocialAccount', function () {
    $model = SocialAccount::factory()->create();
    expect($model)->toBeInstanceOf(SocialAccount::class);
});

test('SocialAccount has required attributes', function () {
    $model = SocialAccount::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
