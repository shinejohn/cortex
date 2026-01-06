<?php

use App\Models\SocialGroup;

test('can create SocialGroup', function () {
    $model = SocialGroup::factory()->create();
    expect($model)->toBeInstanceOf(SocialGroup::class);
    expect($model->id)->toBeString();
});

test('SocialGroup has required attributes', function () {
    $model = SocialGroup::factory()->create();
    expect($model->id)->toBeString();
    expect($model->created_at)->not->toBeNull();
});
