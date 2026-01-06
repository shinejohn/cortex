<?php

use App\Models\EmailCampaign;

test('can create EmailCampaign', function () {
    $model = EmailCampaign::factory()->create();
    expect($model)->toBeInstanceOf(EmailCampaign::class);
});

test('EmailCampaign has required attributes', function () {
    $model = EmailCampaign::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
