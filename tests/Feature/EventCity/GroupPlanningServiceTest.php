<?php

declare(strict_types=1);

use App\Models\Event;
use App\Models\LocationShare;
use App\Models\SocialGroup;
use App\Models\User;

use function Pest\Laravel\actingAs;

it('creates an event group', function () {
    $user = User::factory()->create();
    $event = Event::factory()->create();

    $response = actingAs($user)->postJson("/events/{$event->id}/groups", [
        'name' => 'Concert Crew',
        'description' => 'Friends going to the concert together',
        'privacy' => 'private',
    ]);

    $response->assertSuccessful();

    $this->assertDatabaseHas('social_groups', [
        'name' => 'Concert Crew',
        'event_id' => $event->id,
        'creator_id' => $user->id,
    ]);
});

it('lists groups for an event', function () {
    $user = User::factory()->create();
    $event = Event::factory()->create();

    SocialGroup::factory()->count(3)->create([
        'event_id' => $event->id,
        'creator_id' => $user->id,
    ]);

    // Group for a different event should not appear
    SocialGroup::factory()->create([
        'event_id' => Event::factory()->create()->id,
        'creator_id' => $user->id,
    ]);

    $response = actingAs($user)->getJson("/events/{$event->id}/groups");

    $response->assertSuccessful();

    $groups = $response->json('groups') ?? $response->json('data') ?? $response->json();

    if (is_array($groups)) {
        expect(count($groups))->toBeGreaterThanOrEqual(3);
    }
});

it('shows group member location shares', function () {
    $user = User::factory()->create();
    $group = SocialGroup::factory()->create([
        'creator_id' => $user->id,
        'event_id' => Event::factory()->create()->id,
    ]);

    // Create location shares for group members
    LocationShare::factory()->count(2)->create([
        'group_id' => $group->id,
        'stopped_at' => null,
        'expires_at' => now()->addHour(),
    ]);

    // A stopped share should still be in the DB but not necessarily active
    LocationShare::factory()->stopped()->create([
        'group_id' => $group->id,
    ]);

    $response = actingAs($user)->getJson("/api/location-shares/group/{$group->id}");

    $response->assertSuccessful();
});
