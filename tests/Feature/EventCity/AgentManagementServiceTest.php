<?php

declare(strict_types=1);

use App\Models\AgentClient;
use App\Models\BookingAgent;
use App\Models\User;
use App\Services\EventCity\AgentManagementService;

use function Pest\Laravel\withoutMiddleware;

beforeEach(function () {
    withoutMiddleware();
    $this->service = app(AgentManagementService::class);
});

it('registers a new agent with correct defaults', function () {
    $user = User::factory()->create();

    $agent = $this->service->registerAgent($user, [
        'agency_name' => 'Sunshine Talent Agency',
        'bio' => 'Premier Florida talent management.',
        'specialties' => ['Pop', 'Country'],
        'service_areas' => ['Florida'],
    ]);

    expect($agent)->toBeInstanceOf(BookingAgent::class)
        ->and($agent->user_id)->toBe($user->id)
        ->and($agent->agency_name)->toBe('Sunshine Talent Agency')
        ->and($agent->bio)->toBe('Premier Florida talent management.')
        ->and($agent->specialties)->toBe(['Pop', 'Country'])
        ->and($agent->service_areas)->toBe(['Florida'])
        ->and($agent->subscription_tier)->toBe('free')
        ->and($agent->max_clients)->toBe(3)
        ->and($agent->slug)->toStartWith('sunshine-talent-agency-');
});

it('adds a client to an agent', function () {
    $agent = BookingAgent::factory()->create(['max_clients' => 5]);
    $clientUser = User::factory()->create();

    $client = $this->service->addClient($agent, $clientUser, [
        'client_type' => 'performer',
        'permissions' => ['manage_bookings'],
    ]);

    expect($client)->toBeInstanceOf(AgentClient::class)
        ->and($client->booking_agent_id)->toBe($agent->id)
        ->and($client->user_id)->toBe($clientUser->id)
        ->and($client->client_type)->toBe('performer')
        ->and($client->status)->toBe('active')
        ->and($client->authorized_at)->not->toBeNull();
});

it('prevents adding a client when at client limit', function () {
    $agent = BookingAgent::factory()->create(['max_clients' => 2]);

    // Create 2 active clients to fill the limit
    AgentClient::factory()->active()->count(2)->create([
        'booking_agent_id' => $agent->id,
    ]);

    $newClientUser = User::factory()->create();

    expect(fn () => $this->service->addClient($agent, $newClientUser, [
        'client_type' => 'performer',
    ]))->toThrow(RuntimeException::class, 'Client limit reached');
});

it('removes a client from an agent', function () {
    $agent = BookingAgent::factory()->create();
    $client = AgentClient::factory()->active()->create([
        'booking_agent_id' => $agent->id,
    ]);

    $this->service->removeClient($client);

    $client->refresh();

    expect($client->status)->toBe('revoked')
        ->and($client->revoked_at)->not->toBeNull();
});

it('returns correct dashboard data for agent', function () {
    $agent = BookingAgent::factory()->create();

    AgentClient::factory()->active()->count(3)->create([
        'booking_agent_id' => $agent->id,
    ]);

    AgentClient::factory()->create([
        'booking_agent_id' => $agent->id,
        'status' => 'pending',
    ]);

    $data = $this->service->getAgentDashboardData($agent);

    expect($data)->toHaveKeys([
        'agent',
        'active_clients',
        'pending_clients',
        'total_commissions',
        'pending_commissions',
        'recent_commissions',
    ])
        ->and($data['active_clients'])->toHaveCount(3)
        ->and($data['pending_clients'])->toHaveCount(1);
});
