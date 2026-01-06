<?php

use App\Models\NotificationSubscription;
use App\Models\User;
use App\Models\Business;

test('can create notification subscription', function () {
    $user = User::factory()->create();
    
    $subscription = NotificationSubscription::factory()->create([
        'user_id' => $user->id,
        'platform' => 'daynews',
        'community_id' => 'chicago-il',
    ]);
    
    expect($subscription)->toBeInstanceOf(NotificationSubscription::class);
    expect($subscription->id)->toBeString();
});

test('notification subscription has required attributes', function () {
    $user = User::factory()->create();
    
    $subscription = NotificationSubscription::factory()->create([
        'user_id' => $user->id,
        'platform' => 'daynews',
        'community_id' => 'chicago-il',
        'status' => 'active',
    ]);
    
    expect($subscription->platform)->toBe('daynews');
    expect($subscription->community_id)->toBe('chicago-il');
    expect($subscription->status)->toBe('active');
});

test('notification subscription belongs to user', function () {
    $user = User::factory()->create();
    
    $subscription = NotificationSubscription::factory()->create([
        'user_id' => $user->id,
        'platform' => 'daynews',
    ]);
    
    expect($subscription->user)->toBeInstanceOf(User::class);
    expect($subscription->user->id)->toBe($user->id);
});

test('notification subscription can belong to business', function () {
    $user = User::factory()->create();
    $business = Business::factory()->create();
    
    $subscription = NotificationSubscription::factory()->create([
        'user_id' => $user->id,
        'business_id' => $business->id,
        'platform' => 'daynews',
    ]);
    
    expect($subscription->business)->toBeInstanceOf(Business::class);
    expect($subscription->business->id)->toBe($business->id);
});

test('notification subscription has notification types array', function () {
    $user = User::factory()->create();
    
    $subscription = NotificationSubscription::factory()->create([
        'user_id' => $user->id,
        'platform' => 'daynews',
        'notification_types' => ['breaking_news', 'events'],
    ]);
    
    expect($subscription->notification_types)->toBeArray();
    expect($subscription->notification_types)->toContain('breaking_news');
    expect($subscription->notification_types)->toContain('events');
});

test('user can have unique subscription per platform and community', function () {
    $user = User::factory()->create();
    
    NotificationSubscription::factory()->create([
        'user_id' => $user->id,
        'platform' => 'daynews',
        'community_id' => 'chicago-il',
    ]);
    
    expect(function () use ($user) {
        NotificationSubscription::factory()->create([
            'user_id' => $user->id,
            'platform' => 'daynews',
            'community_id' => 'chicago-il',
        ]);
    })->toThrow(Illuminate\Database\QueryException::class);
});
