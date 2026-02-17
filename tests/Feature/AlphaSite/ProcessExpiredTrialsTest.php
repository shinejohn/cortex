<?php

declare(strict_types=1);

use App\Models\Business;
use App\Models\BusinessSubscription;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->business = Business::factory()->create([
        'subscription_tier' => 'premiere',
        'ai_services_enabled' => true,
    ]);
});

it('downgrades expired trial to basic', function () {
    BusinessSubscription::create([
        'business_id' => $this->business->id,
        'tier' => 'trial',
        'status' => 'active',
        'trial_started_at' => now()->subDays(100),
        'trial_expires_at' => now()->subDays(10),
        'trial_converted_at' => null,
    ]);

    $this->artisan('alphasite:process-expired-trials')
        ->assertSuccessful();

    $this->business->refresh();
    $subscription = $this->business->subscription;

    expect($subscription->tier)->toBe('basic')
        ->and($subscription->status)->toBe('expired')
        ->and($subscription->downgraded_at)->not->toBeNull()
        ->and($this->business->subscription_tier)->toBe('basic')
        ->and($this->business->ai_services_enabled)->toBeFalse();
});

it('does not affect active paid subscription', function () {
    BusinessSubscription::create([
        'business_id' => $this->business->id,
        'tier' => 'standard',
        'status' => 'active',
        'trial_started_at' => now()->subDays(100),
        'trial_expires_at' => now()->subDays(10),
        'trial_converted_at' => now()->subDays(50),
        'stripe_subscription_id' => 'sub_xxx',
    ]);

    $this->artisan('alphasite:process-expired-trials')
        ->assertSuccessful();

    $this->business->refresh();
    $subscription = $this->business->subscription;

    expect($subscription->tier)->toBe('standard')
        ->and($subscription->status)->toBe('active')
        ->and($subscription->downgraded_at)->toBeNull();
});

it('does not affect active trial within 90 days', function () {
    BusinessSubscription::create([
        'business_id' => $this->business->id,
        'tier' => 'trial',
        'status' => 'active',
        'trial_started_at' => now()->subDays(30),
        'trial_expires_at' => now()->addDays(60),
        'trial_converted_at' => null,
    ]);

    $this->artisan('alphasite:process-expired-trials')
        ->assertSuccessful();

    $this->business->refresh();
    $subscription = $this->business->subscription;

    expect($subscription->tier)->toBe('trial')
        ->and($subscription->status)->toBe('active')
        ->and($subscription->downgraded_at)->toBeNull();
});

it('does not affect business with no subscription', function () {
    $this->business->update(['subscription_tier' => 'basic']);

    $this->artisan('alphasite:process-expired-trials')
        ->assertSuccessful();

    $this->business->refresh();
    expect($this->business->subscription)->toBeNull();
});
