<?php

declare(strict_types=1);

use App\Models\BookingAgent;

use function Pest\Laravel\getJson;
use function Pest\Laravel\withoutMiddleware;

beforeEach(function () {
    withoutMiddleware();
});

it('shows the marketplace with visible agents', function () {
    BookingAgent::factory()->marketplaceVisible()->count(3)->create();
    BookingAgent::factory()->create(['is_marketplace_visible' => false]);

    $response = getJson('/agents');

    $response->assertSuccessful();

    $agents = $response->json('props.agents.data');

    expect($agents)->toHaveCount(3);
});

it('filters marketplace by specialty', function () {
    BookingAgent::factory()->marketplaceVisible()->create([
        'specialties' => ['Rock', 'Jazz'],
    ]);
    BookingAgent::factory()->marketplaceVisible()->create([
        'specialties' => ['Classical', 'Jazz'],
    ]);
    BookingAgent::factory()->marketplaceVisible()->create([
        'specialties' => ['Country'],
    ]);

    $response = getJson('/agents?specialty=Jazz');

    $response->assertSuccessful();

    $agents = $response->json('props.agents.data');

    expect($agents)->toHaveCount(2);
});

it('shows agent profile page by slug', function () {
    $agent = BookingAgent::factory()->marketplaceVisible()->create([
        'agency_name' => 'Starlight Talent',
    ]);

    $response = getJson("/agents/{$agent->slug}");

    $response->assertSuccessful();
    $response->assertJsonPath('props.agent.id', $agent->id);
    $response->assertJsonPath('props.agent.agency_name', 'Starlight Talent');
});

it('returns 404 for non-existent agent slug', function () {
    $response = getJson('/agents/nonexistent-slug-12345');

    $response->assertNotFound();
});
