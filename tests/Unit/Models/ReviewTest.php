<?php

use App\Models\Review;
use App\Models\Business;
use App\Models\User;

test('can create review', function () {
    $business = Business::factory()->create();
    $user = User::factory()->create();
    
    $review = Review::factory()->create([
        'business_id' => $business->id,
        'user_id' => $user->id,
    ]);
    
    expect($review)->toBeInstanceOf(Review::class);
    expect($review->id)->toBeString();
});

test('review has required attributes', function () {
    $business = Business::factory()->create();
    $user = User::factory()->create();
    
    $review = Review::factory()->create([
        'business_id' => $business->id,
        'user_id' => $user->id,
        'rating' => 5,
        'comment' => 'Great business!',
    ]);
    
    expect($review->rating)->toBe(5);
    expect($review->comment)->toBe('Great business!');
});

test('review belongs to business', function () {
    $business = Business::factory()->create();
    $user = User::factory()->create();
    
    $review = Review::factory()->create([
        'business_id' => $business->id,
        'user_id' => $user->id,
    ]);
    
    expect($review->business)->toBeInstanceOf(Business::class);
    expect($review->business->id)->toBe($business->id);
});

test('review belongs to user', function () {
    $business = Business::factory()->create();
    $user = User::factory()->create();
    
    $review = Review::factory()->create([
        'business_id' => $business->id,
        'user_id' => $user->id,
    ]);
    
    expect($review->user)->toBeInstanceOf(User::class);
    expect($review->user->id)->toBe($user->id);
});
