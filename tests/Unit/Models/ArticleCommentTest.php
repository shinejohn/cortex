<?php

use App\Models\ArticleComment;

test('can create ArticleComment', function () {
    $model = ArticleComment::factory()->create();
    expect($model)->toBeInstanceOf(ArticleComment::class);
    expect($model->id)->toBeString();
});

test('ArticleComment has required attributes', function () {
    $model = ArticleComment::factory()->create();
    expect($model->id)->toBeString();
    expect($model->created_at)->not->toBeNull();
});
