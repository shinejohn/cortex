<?php

use App\Models\SocialPostShare;

test('can create SocialPostShare', function () {
    $model = SocialPostShare::factory()->create();
    expect($model)->toBeInstanceOf(SocialPostShare::class);
});

test('SocialPostShare has required attributes', function () {
    $model = SocialPostShare::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
