<?php

use App\Models\EmailTemplate;

test('can create EmailTemplate', function () {
    $model = EmailTemplate::factory()->create();
    expect($model)->toBeInstanceOf(EmailTemplate::class);
});

test('EmailTemplate has required attributes', function () {
    $model = EmailTemplate::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
