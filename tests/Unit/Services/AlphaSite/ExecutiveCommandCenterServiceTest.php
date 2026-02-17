<?php

declare(strict_types=1);

use App\Models\Business;
use App\Models\Industry;
use App\Models\SMBCrmCustomer;
use App\Models\SMBCrmInteraction;
use App\Models\User;
use App\Services\AlphaSite\ExecutiveCommandCenterService;

test('getCommandCenterData returns metrics alerts activity quick_actions', function () {
    $user = User::factory()->create();
    $industry = Industry::factory()->create();
    $business = Business::factory()->create([
        'industry_id' => $industry->id,
        'claimed_by_id' => $user->id,
    ]);

    $service = app(ExecutiveCommandCenterService::class);
    $data = $service->getCommandCenterData($business);

    expect($data)->toHaveKeys(['metrics', 'alerts', 'activity', 'quick_actions']);
    expect($data['metrics'])->toHaveKeys([
        'total_customers',
        'new_leads_today',
        'interactions_today',
        'ai_handled_rate',
        'average_health_score',
    ]);
    expect($data['quick_actions'])->toBeArray();
    expect($data['quick_actions'])->not->toBeEmpty();
});

test('getAlerts includes trial expiring when subscription is trial', function () {
    $user = User::factory()->create();
    $industry = Industry::factory()->create();
    $business = Business::factory()->create([
        'industry_id' => $industry->id,
        'claimed_by_id' => $user->id,
    ]);

    App\Models\BusinessSubscription::factory()->create([
        'business_id' => $business->id,
        'tier' => 'trial',
        'trial_expires_at' => now()->addDays(2),
    ]);

    $service = app(ExecutiveCommandCenterService::class);
    $data = $service->getCommandCenterData($business);

    $trialAlert = collect($data['alerts'])->firstWhere('id', 'trial-expiring');
    expect($trialAlert)->not->toBeNull();
    expect($trialAlert['type'])->toBeIn(['critical', 'warning']);
});

test('getAlerts includes customers needing attention when health score low', function () {
    $industry = Industry::factory()->create();
    $business = Business::factory()->create(['industry_id' => $industry->id]);

    SMBCrmCustomer::factory()->create([
        'business_id' => $business->id,
        'health_score' => 30, // integer for DB, factory may use string - override explicitly
    ]);

    $service = app(ExecutiveCommandCenterService::class);
    $data = $service->getCommandCenterData($business);

    $alert = collect($data['alerts'])->firstWhere('id', 'customers-need-attention');
    expect($alert)->not->toBeNull();
});

test('getRecentActivity includes interactions', function () {
    $industry = Industry::factory()->create();
    $business = Business::factory()->create(['industry_id' => $industry->id]);
    $customer = SMBCrmCustomer::factory()->create([
        'business_id' => $business->id,
        'first_name' => 'Jane',
        'last_name' => 'Doe',
    ]);

    SMBCrmInteraction::create([
        'business_id' => $business->id,
        'customer_id' => $customer->id,
        'interaction_type' => 'chat',
        'channel' => 'alphasite',
        'direction' => 'inbound',
        'handled_by' => 'ai',
        'outcome' => 'resolved',
        'created_at' => now(),
    ]);

    $service = app(ExecutiveCommandCenterService::class);
    $data = $service->getCommandCenterData($business);

    expect($data['activity'])->not->toBeEmpty();
    expect($data['activity'][0]['type'])->toBe('interaction');
});
