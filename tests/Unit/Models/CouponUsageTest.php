<?php

use App\Models\CouponUsage;

test('can create CouponUsage', function () {
    $model = CouponUsage::factory()->create();
    expect($model)->toBeInstanceOf(CouponUsage::class);
    expect($model->id)->toBeInt(); // Uses integer ID, not UUID
});

test('CouponUsage has required attributes', function () {
    $model = CouponUsage::factory()->create();
    expect($model->id)->toBeInt(); // Uses integer ID, not UUID
    expect($model->created_at)->not->toBeNull();
});

test('CouponUsage can be updated', function () {
    $model = CouponUsage::factory()->create();
    $originalUpdated = $model->updated_at;
    
    sleep(1);
    $model->touch();
    
    expect($model->updated_at)->not->toBe($originalUpdated);
});
