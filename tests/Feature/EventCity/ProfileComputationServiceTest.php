<?php

declare(strict_types=1);

use App\Models\User;
use App\Models\UserBehavioralEvent;
use App\Models\UserBehavioralProfile;
use App\Models\UserSegment;
use App\Services\EventCity\ProfileComputationService;

use function Pest\Laravel\withoutMiddleware;

beforeEach(function () {
    withoutMiddleware();
});

it('computes a behavioral profile from user events', function () {
    $user = User::factory()->create();

    UserBehavioralEvent::factory()->count(5)->create([
        'user_id' => $user->id,
        'event_type' => 'event_view',
        'category' => 'music',
        'occurred_at' => now()->subDays(10),
    ]);

    UserBehavioralEvent::factory()->count(3)->create([
        'user_id' => $user->id,
        'event_type' => 'ticket_purchase',
        'category' => 'food',
        'context' => ['amount' => 50],
        'occurred_at' => now()->subDays(5),
    ]);

    $service = app(ProfileComputationService::class);
    $profile = $service->computeProfile($user);

    expect($profile)->toBeInstanceOf(UserBehavioralProfile::class);
    expect($profile->user_id)->toBe($user->id);
    expect($profile->category_affinities)->toBeArray();
    expect($profile->category_affinities)->toHaveKey('music');
    expect($profile->category_affinities)->toHaveKey('food');
    expect($profile->temporal_patterns)->toBeArray();
    expect($profile->spending_patterns)->toBeArray();
    expect($profile->engagement_score)->toBeGreaterThan(0);
    expect($profile->last_computed_at)->not->toBeNull();

    $this->assertDatabaseHas('user_behavioral_profiles', [
        'user_id' => $user->id,
    ]);
});

it('computes profiles in batch for users with stale profiles', function () {
    $userWithStaleProfile = User::factory()->create();
    UserBehavioralProfile::factory()->stale()->create([
        'user_id' => $userWithStaleProfile->id,
    ]);
    UserBehavioralEvent::factory()->create([
        'user_id' => $userWithStaleProfile->id,
        'occurred_at' => now()->subDays(2),
    ]);

    $userWithFreshProfile = User::factory()->create();
    UserBehavioralProfile::factory()->create([
        'user_id' => $userWithFreshProfile->id,
        'last_computed_at' => now()->subHours(1),
    ]);

    $service = app(ProfileComputationService::class);
    $processed = $service->computeProfilesInBatch(50);

    expect($processed)->toBeGreaterThanOrEqual(1);

    $staleProfile = UserBehavioralProfile::where('user_id', $userWithStaleProfile->id)->first();
    expect($staleProfile->last_computed_at->isToday())->toBeTrue();
});

it('assigns auto segments based on engagement score and affinities', function () {
    $user = User::factory()->create();

    $segment = UserSegment::factory()->auto()->create([
        'criteria' => [
            'min_engagement_score' => 50,
            'category' => 'music',
        ],
    ]);

    $profile = UserBehavioralProfile::factory()->create([
        'user_id' => $user->id,
        'engagement_score' => 80,
        'category_affinities' => [
            'music' => 0.85,
            'food' => 0.30,
        ],
    ]);

    $service = app(ProfileComputationService::class);
    $service->assignAutoSegments($profile);

    $profile->refresh();

    expect($profile->auto_segments)->toBeArray();
    expect($profile->auto_segments)->toContain('music_enthusiast');
    expect($profile->auto_segments)->toContain('power_user');

    $this->assertDatabaseHas('user_segment_memberships', [
        'user_segment_id' => $segment->id,
        'user_id' => $user->id,
    ]);
});
