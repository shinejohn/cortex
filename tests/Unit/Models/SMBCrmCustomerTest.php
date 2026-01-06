<?php

use App\Models\SMBCrmCustomer;

test('can create SMBCrmCustomer', function () {
    $model = SMBCrmCustomer::factory()->create();
    expect($model)->toBeInstanceOf(SMBCrmCustomer::class);
});

test('SMBCrmCustomer has required attributes', function () {
    $model = SMBCrmCustomer::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
