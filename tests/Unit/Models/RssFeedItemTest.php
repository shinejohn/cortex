<?php

use App\Models\RssFeedItem;

test('can create RssFeedItem', function () {
    $model = RssFeedItem::factory()->create();
    expect($model)->toBeInstanceOf(RssFeedItem::class);
});

test('RssFeedItem has required attributes', function () {
    $model = RssFeedItem::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
