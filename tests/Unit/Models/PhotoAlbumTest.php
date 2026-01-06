<?php

use App\Models\PhotoAlbum;

test('can create PhotoAlbum', function () {
    $model = PhotoAlbum::factory()->create();
    expect($model)->toBeInstanceOf(PhotoAlbum::class);
    expect($model->id)->toBeString();
});

test('PhotoAlbum has required attributes', function () {
    $model = PhotoAlbum::factory()->create();
    expect($model->id)->toBeString();
    expect($model->created_at)->not->toBeNull();
});
