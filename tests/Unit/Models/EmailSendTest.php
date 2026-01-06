<?php

use App\Models\EmailSend;

test('can create EmailSend', function () {
    $model = EmailSend::factory()->create();
    expect($model)->toBeInstanceOf(EmailSend::class);
});

test('EmailSend has required attributes', function () {
    $model = EmailSend::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
