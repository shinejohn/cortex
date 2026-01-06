<?php

use App\Models\ArticleCommentLike;

test('can create ArticleCommentLike', function () {
    $model = ArticleCommentLike::factory()->create();
    expect($model)->toBeInstanceOf(ArticleCommentLike::class);
    expect($model->id)->toBeInt(); // Uses integer ID, not UUID
});

test('ArticleCommentLike has required attributes', function () {
    $model = ArticleCommentLike::factory()->create();
    expect($model->id)->toBeInt(); // Uses integer ID, not UUID
    expect($model->created_at)->not->toBeNull();
});

test('ArticleCommentLike can be updated', function () {
    $model = ArticleCommentLike::factory()->create();
    $originalUpdated = $model->updated_at;
    
    sleep(1);
    $model->touch();
    
    expect($model->updated_at)->not->toBe($originalUpdated);
});
