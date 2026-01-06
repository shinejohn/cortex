<?php

use App\Models\Business;
use App\Models\Review;
use App\Models\Rating;
use App\Models\Coupon;
use App\Models\User;

test('can create business', function () {
    $business = Business::factory()->create();
    
    expect($business)->toBeInstanceOf(Business::class);
    expect($business->id)->toBeString();
});

test('business has required attributes', function () {
    $business = Business::factory()->create([
        'name' => 'Test Business',
        'slug' => 'test-business',
    ]);
    
    expect($business->name)->toBe('Test Business');
    expect($business->slug)->toBe('test-business');
});

test('business has reviews relationship', function () {
    $business = Business::factory()->create();
    $user = User::factory()->create();
    
    Review::factory()->create([
        'business_id' => $business->id,
        'user_id' => $user->id,
    ]);
    
    expect($business->reviews)->toHaveCount(1);
});

test('business has ratings relationship', function () {
    $business = Business::factory()->create();
    $user = User::factory()->create();
    
    Rating::factory()->create([
        'rateable_id' => $business->id,
        'rateable_type' => Business::class,
        'user_id' => $user->id,
    ]);
    
    expect($business->ratings)->toHaveCount(1);
});

test('business has coupons relationship', function () {
    $business = Business::factory()->create();
    
    Coupon::factory()->create(['business_id' => $business->id]);
    Coupon::factory()->create(['business_id' => $business->id]);
    
    expect($business->coupons)->toHaveCount(2);
});

test('business slug is unique', function () {
    Business::factory()->create(['slug' => 'test-business']);
    
    expect(function () {
        Business::factory()->create(['slug' => 'test-business']);
    })->toThrow(Illuminate\Database\QueryException::class);
});
