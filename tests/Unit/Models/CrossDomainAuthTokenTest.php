<?php

use App\Models\CrossDomainAuthToken;

test('can create CrossDomainAuthToken', function () {
    $model = CrossDomainAuthToken::factory()->create();
    expect($model)->toBeInstanceOf(CrossDomainAuthToken::class);
});

test('CrossDomainAuthToken has required attributes', function () {
    $model = CrossDomainAuthToken::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
