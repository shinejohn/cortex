<?php

use App\Models\HubMember;

test('can create HubMember', function () {
    $model = HubMember::factory()->create();
    expect($model)->toBeInstanceOf(HubMember::class);
    expect($model->id)->toBeString();
});

test('HubMember has required attributes', function () {
    $model = HubMember::factory()->create();
    expect($model->id)->toBeString();
    expect($model->created_at)->not->toBeNull();
});
