<?php

declare(strict_types=1);

use App\Models\BookingAgent;
use App\Models\User;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\withoutMiddleware;

beforeEach(function () {
    withoutMiddleware();
});

it('allows an authenticated user to register as a booking agent', function () {
    $user = User::factory()->create();

    actingAs($user)
        ->postJson('/agent/register', [
            'agency_name' => 'Tampa Bay Bookings',
            'bio' => 'We book the best talent in Tampa Bay.',
            'specialties' => ['Rock', 'Jazz'],
            'service_areas' => ['Florida', 'Georgia'],
        ])
        ->assertRedirect(route('agent.dashboard'));

    $agent = BookingAgent::where('user_id', $user->id)->first();

    expect($agent)->not->toBeNull()
        ->and($agent->agency_name)->toBe('Tampa Bay Bookings')
        ->and($agent->bio)->toBe('We book the best talent in Tampa Bay.')
        ->and($agent->specialties)->toBe(['Rock', 'Jazz'])
        ->and($agent->service_areas)->toBe(['Florida', 'Georgia']);
});

it('validates required fields when registering', function () {
    $user = User::factory()->create();

    actingAs($user)
        ->postJson('/agent/register', [
            'bio' => 'Missing the agency name',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['agency_name']);
});

it('prevents duplicate agent registration', function () {
    $user = User::factory()->create();
    BookingAgent::factory()->create(['user_id' => $user->id]);

    actingAs($user)
        ->postJson('/agent/register', [
            'agency_name' => 'Duplicate Agency',
        ])
        ->assertRedirect(route('agent.dashboard'));

    expect(BookingAgent::where('user_id', $user->id)->count())->toBe(1);
});

it('creates agent with free tier by default', function () {
    $user = User::factory()->create();

    actingAs($user)
        ->postJson('/agent/register', [
            'agency_name' => 'Free Tier Agency',
        ]);

    $agent = BookingAgent::where('user_id', $user->id)->first();

    expect($agent->subscription_tier)->toBe('free')
        ->and($agent->max_clients)->toBe(3)
        ->and($agent->is_marketplace_visible)->toBeTrue();
});
