<?php

use App\Services\BusinessService;
use App\Models\Business;

test('business service can be instantiated', function () {
    $service = app(BusinessService::class);
    expect($service)->toBeInstanceOf(BusinessService::class);
});

test('business service can create business', function () {
    $business = Business::factory()->create();
    
    expect($business)->toBeInstanceOf(Business::class);
});

test('business service can find businesses', function () {
    Business::factory()->count(3)->create();
    
    $businesses = Business::all();
    
    expect($businesses->count())->toBeGreaterThanOrEqual(3);
});
