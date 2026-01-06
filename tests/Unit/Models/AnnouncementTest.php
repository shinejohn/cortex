<?php

use App\Models\Announcement;

test('can create Announcement', function () {
    $model = Announcement::factory()->create();
    expect($model)->toBeInstanceOf(Announcement::class);
    expect($model->id)->toBeString();
});

test('Announcement has required attributes', function () {
    $model = Announcement::factory()->create();
    expect($model->id)->toBeString();
    expect($model->created_at)->not->toBeNull();
});
