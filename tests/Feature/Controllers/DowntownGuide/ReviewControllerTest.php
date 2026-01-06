<?php

use App\Models\User;
use App\Models\Business;
use App\Models\Review;

test('review controller exists', function () {
    expect(class_exists("App\\Http\\Controllers\\DowntownGuide\\ReviewController"))->toBeTrue();
});

test('authenticated user can submit review', function () {
    $user = User::factory()->create();
    $business = Business::factory()->create();
    
    $response = $this->actingAs($user)->post("/downtown-guide/businesses/{$business->id}/reviews", [
        'rating' => 5,
        'comment' => 'Great business!',
    ]);
    
    expect($response->status())->toBeIn([200, 201, 302]);
});

test('review controller requires authentication', function () {
    $business = Business::factory()->create();
    
    $response = $this->post("/downtown-guide/businesses/{$business->id}/reviews");
    
    expect($response->status())->toBeIn([302, 401]);
});
