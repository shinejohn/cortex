<?php

use App\Models\EmailSubscriber;

test('can create EmailSubscriber', function () {
    $model = EmailSubscriber::factory()->create();
    expect($model)->toBeInstanceOf(EmailSubscriber::class);
});

test('EmailSubscriber has required attributes', function () {
    $model = EmailSubscriber::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
