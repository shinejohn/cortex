<?php

use App\Models\NewsletterSubscription;

test('can create NewsletterSubscription', function () {
    $model = NewsletterSubscription::factory()->create();
    expect($model)->toBeInstanceOf(NewsletterSubscription::class);
});

test('NewsletterSubscription has required attributes', function () {
    $model = NewsletterSubscription::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
