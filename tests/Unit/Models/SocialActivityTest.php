<?php

use App\Models\SocialActivity;

test('can create SocialActivity', function () {
    $model = SocialActivity::factory()->create();
    expect($model)->toBeInstanceOf(SocialActivity::class);
});

test('SocialActivity has required attributes', function () {
    $model = SocialActivity::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
