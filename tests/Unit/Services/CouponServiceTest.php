<?php

use App\Services\CouponService;
use App\Models\Coupon;
use App\Models\Business;

test('coupon service can be instantiated', function () {
    $service = app(CouponService::class);
    expect($service)->toBeInstanceOf(CouponService::class);
});

test('coupon service can create coupon', function () {
    $business = Business::factory()->create();
    
    $coupon = Coupon::factory()->create([
        'business_id' => $business->id,
        'title' => 'Test Coupon',
    ]);
    
    expect($coupon)->toBeInstanceOf(Coupon::class);
    expect($coupon->title)->toBe('Test Coupon');
});

test('coupon service can find active coupons', function () {
    $business = Business::factory()->create();
    
    Coupon::factory()->create([
        'business_id' => $business->id,
        'is_active' => true,
        'expires_at' => now()->addDay(),
    ]);
    
    Coupon::factory()->create([
        'business_id' => $business->id,
        'is_active' => false,
    ]);
    
    $activeCoupons = Coupon::where('business_id', $business->id)
        ->where('is_active', true)
        ->get();
    
    expect($activeCoupons->count())->toBeGreaterThanOrEqual(1);
});
