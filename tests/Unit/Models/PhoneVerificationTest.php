<?php

use App\Models\PhoneVerification;

test('can create PhoneVerification', function () {
    $model = PhoneVerification::factory()->create();
    expect($model)->toBeInstanceOf(PhoneVerification::class);
});

test('PhoneVerification has required attributes', function () {
    $model = PhoneVerification::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
