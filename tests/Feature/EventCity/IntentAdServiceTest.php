<?php

declare(strict_types=1);

use App\Models\AdCampaign;
use App\Models\Business;
use App\Models\User;
use App\Models\UserBehavioralProfile;
use App\Services\EventCity\IntentAdService;

use function Pest\Laravel\withoutMiddleware;

beforeEach(function () {
    withoutMiddleware();
});

it('matches ads to a user based on behavioral profile', function () {
    $user = User::factory()->create();

    UserBehavioralProfile::factory()->create([
        'user_id' => $user->id,
        'category_affinities' => [
            'music' => 0.9,
            'food' => 0.6,
            'sports' => 0.2,
        ],
        'engagement_score' => 75,
    ]);

    $business = Business::factory()->create();

    // Active campaign targeting music category
    $matchingCampaign = AdCampaign::factory()->create([
        'advertiser_id' => $business->id,
        'status' => 'active',
        'budget' => 1000.00,
        'spent' => 100.00,
        'daily_budget' => 50.00,
        'start_date' => now()->subDays(5),
        'end_date' => now()->addDays(30),
        'targeting' => ['categories' => ['music']],
    ]);

    // Inactive campaign should not be matched
    AdCampaign::factory()->create([
        'advertiser_id' => $business->id,
        'status' => 'paused',
        'budget' => 500.00,
        'spent' => 0.00,
        'start_date' => now()->subDays(5),
        'end_date' => now()->addDays(30),
        'targeting' => ['categories' => ['music']],
    ]);

    $service = app(IntentAdService::class);
    $matchedAds = $service->matchAdsToUser($user);

    expect($matchedAds)->not->toBeEmpty();
    expect($matchedAds->pluck('id')->toArray())->toContain($matchingCampaign->id);
});

it('records an intent impression', function () {
    $user = User::factory()->create();
    $business = Business::factory()->create();

    $campaign = AdCampaign::factory()->create([
        'advertiser_id' => $business->id,
        'status' => 'active',
        'budget' => 1000.00,
        'spent' => 0.00,
        'start_date' => now()->subDay(),
        'end_date' => now()->addMonth(),
    ]);

    $service = app(IntentAdService::class);
    $service->recordIntentImpression($user, $campaign->id);

    $this->assertDatabaseHas('ad_impressions', [
        'ad_campaign_id' => $campaign->id,
        'user_id' => $user->id,
        'impression_type' => 'intent',
    ]);
});

it('creates an intent-targeted ad campaign', function () {
    $business = Business::factory()->create();

    $service = app(IntentAdService::class);
    $campaign = $service->createIntentCampaign([
        'advertiser_id' => $business->id,
        'name' => 'Music Lovers Intent Campaign',
        'description' => 'Target users who frequently view music events',
        'status' => 'active',
        'budget' => 2000.00,
        'spent' => 0.00,
        'daily_budget' => 100.00,
        'start_date' => now(),
        'end_date' => now()->addMonths(2),
        'targeting' => [
            'categories' => ['music', 'nightlife'],
            'min_engagement_score' => 50,
        ],
    ]);

    expect($campaign)->toBeInstanceOf(AdCampaign::class);
    expect($campaign->name)->toBe('Music Lovers Intent Campaign');
    expect($campaign->type)->toBe('sponsored');
    expect($campaign->targeting)->toBeArray();
    expect($campaign->targeting['type'])->toBe('behavioral');
    expect($campaign->targeting['intent_based'])->toBeTrue();
    expect($campaign->targeting['categories'])->toContain('music');

    $this->assertDatabaseHas('ad_campaigns', [
        'id' => $campaign->id,
        'name' => 'Music Lovers Intent Campaign',
        'type' => 'sponsored',
    ]);
});
