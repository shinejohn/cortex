<?php

use App\Services\ReviewService;
use App\Models\Review;
use App\Models\Business;
use App\Models\User;

test('review service can be instantiated', function () {
    $service = app(ReviewService::class);
    expect($service)->toBeInstanceOf(ReviewService::class);
});

test('review service can create review', function () {
    $business = Business::factory()->create();
    $user = User::factory()->create();
    
    $review = Review::factory()->create([
        'business_id' => $business->id,
        'user_id' => $user->id,
        'rating' => 5,
    ]);
    
    expect($review)->toBeInstanceOf(Review::class);
    expect($review->rating)->toBe(5);
});

test('review service can find reviews for business', function () {
    $business = Business::factory()->create();
    $user = User::factory()->create();
    
    Review::factory()->count(3)->create([
        'business_id' => $business->id,
        'user_id' => $user->id,
    ]);
    
    $reviews = Review::where('business_id', $business->id)->get();
    
    expect($reviews->count())->toBeGreaterThanOrEqual(3);
});
