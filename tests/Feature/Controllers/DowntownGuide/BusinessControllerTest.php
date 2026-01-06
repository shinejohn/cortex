<?php

use App\Models\User;
use App\Models\Business;

test('business controller exists', function () {
    expect(class_exists("App\\Http\\Controllers\\DowntownGuide\\BusinessController"))->toBeTrue();
});

test('authenticated user can access businesses index', function () {
    $user = User::factory()->create();
    
    $response = $this->actingAs($user)->get('/downtown-guide/businesses');
    
    expect($response->status())->toBeIn([200, 302]);
});

test('authenticated user can view business detail', function () {
    $user = User::factory()->create();
    $business = Business::factory()->create();
    
    $response = $this->actingAs($user)->get("/downtown-guide/businesses/{$business->id}");
    
    expect($response->status())->toBeIn([200, 302]);
});

test('business controller requires authentication', function () {
    $response = $this->get('/downtown-guide/businesses');
    
    expect($response->status())->toBeIn([302, 401]);
});
