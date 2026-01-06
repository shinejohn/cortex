<?php

use App\Models\PromoCodeUsage;

test('can create PromoCodeUsage', function () {
    $model = PromoCodeUsage::factory()->create();
    expect($model)->toBeInstanceOf(PromoCodeUsage::class);
});

test('PromoCodeUsage has required attributes', function () {
    $model = PromoCodeUsage::factory()->create();
    // Add specific attribute tests here
    expect($model)->toHaveKey('id');
});
