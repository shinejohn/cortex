<?php

use App\Models\Coupon;
use App\Models\Business;

test('can create coupon', function () {
    $business = Business::factory()->create();
    $coupon = Coupon::factory()->create(['business_id' => $business->id]);
    
    expect($coupon)->toBeInstanceOf(Coupon::class);
    expect($coupon->id)->toBeString();
});

test('coupon has required attributes', function () {
    $business = Business::factory()->create();
    $coupon = Coupon::factory()->create([
        'business_id' => $business->id,
        'title' => 'Test Coupon',
        'discount_type' => 'percentage',
        'discount_value' => 20,
    ]);
    
    expect($coupon->title)->toBe('Test Coupon');
    expect($coupon->discount_type)->toBe('percentage');
    expect($coupon->discount_value)->toBe(20);
});

test('coupon belongs to business', function () {
    $business = Business::factory()->create();
    $coupon = Coupon::factory()->create(['business_id' => $business->id]);
    
    expect($coupon->business)->toBeInstanceOf(Business::class);
    expect($coupon->business->id)->toBe($business->id);
});

test('coupon can be expired', function () {
    $business = Business::factory()->create();
    $coupon = Coupon::factory()->create([
        'business_id' => $business->id,
        'expires_at' => now()->subDay(),
    ]);
    
    expect($coupon->isExpired())->toBeTrue();
});

test('coupon can be active', function () {
    $business = Business::factory()->create();
    $coupon = Coupon::factory()->create([
        'business_id' => $business->id,
        'expires_at' => now()->addDay(),
        'is_active' => true,
    ]);
    
    expect($coupon->isActive())->toBeTrue();
});
