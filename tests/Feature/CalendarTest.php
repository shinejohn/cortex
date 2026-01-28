<?php

declare(strict_types=1);

use App\Models\Calendar;
use App\Models\Event;
use App\Models\User;
use App\Models\Workspace;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\get;

it('displays the calendars index page', function () {
    Calendar::factory()->count(5)->create();

    $response = get('/calendars');

    $response->assertSuccessful();
    $response->assertInertia(fn($page) => $page->component('event-city/calendars/index'));
});

it('displays public calendars only on index', function () {
    Calendar::factory()->public()->count(3)->create();
    Calendar::factory()->private()->count(2)->create();

    $response = get('/calendars');

    $response->assertSuccessful();
    $response->assertInertia(fn($page) => $page
        ->has('calendars.data', 3));
});

it('allows authenticated users to create calendars', function () {
    $user = User::factory()->create();

    $response = actingAs($user)->post('/calendars', [
        'title' => 'Test Calendar',
        'description' => 'This is a test calendar',
        'category' => 'music',
        'update_frequency' => 'weekly',
        'subscription_price' => 0,
        'is_private' => false,
    ]);

    $response->assertRedirect();
    assertDatabaseHas('calendars', [
        'title' => 'Test Calendar',
        'user_id' => $user->id,
    ]);
});

it('validates calendar creation data', function () {
    $user = User::factory()->create();

    $response = actingAs($user)->post('/calendars', [
        'title' => '', // Missing required field
        'description' => 'Test',
        'category' => 'invalid-category',
    ]);

    $response->assertSessionHasErrors(['title', 'category']);
});

it('allows calendar owners to update their calendars', function () {
    $user = User::factory()->create();
    $calendar = Calendar::factory()->create(['user_id' => $user->id]);

    $response = actingAs($user)->put("/calendars/{$calendar->id}", [
        'title' => 'Updated Title',
    ]);

    $response->assertRedirect();
    assertDatabaseHas('calendars', [
        'id' => $calendar->id,
        'title' => 'Updated Title',
    ]);
});

it('prevents non-owners from updating calendars', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $calendar = Calendar::factory()->create(['user_id' => $owner->id]);

    $response = actingAs($otherUser)->put("/calendars/{$calendar->id}", [
        'title' => 'Hacked Title',
    ]);

    $response->assertForbidden();
});

it('allows calendar owners to delete their calendars', function () {
    $user = User::factory()->create();
    $calendar = Calendar::factory()->create(['user_id' => $user->id]);

    $response = actingAs($user)->delete("/calendars/{$calendar->id}");

    $response->assertRedirect();
    expect(Calendar::find($calendar->id))->toBeNull();
});

it('allows users to follow calendars', function () {
    $user = User::factory()->create();
    $calendar = Calendar::factory()->create();

    $response = actingAs($user)->post("/calendars/{$calendar->id}/follow");

    $response->assertRedirect();
    assertDatabaseHas('calendar_followers', [
        'calendar_id' => $calendar->id,
        'user_id' => $user->id,
    ]);
});

it('allows users to unfollow calendars', function () {
    $user = User::factory()->create();
    $calendar = Calendar::factory()->create();
    $calendar->followers()->attach($user->id);

    $response = actingAs($user)->post("/calendars/{$calendar->id}/follow");

    $response->assertRedirect();
    expect($calendar->followers()->where('user_id', $user->id)->exists())->toBeFalse();
});

it('allows calendar owners to add events', function () {
    $user = User::factory()->create();
    $calendar = Calendar::factory()->create(['user_id' => $user->id]);
    $workspace = App\Models\Workspace::factory()->create();
    $event = Event::factory()->create(['workspace_id' => $workspace->id, 'created_by' => $user->id]);

    $response = actingAs($user)->post("/calendars/{$calendar->id}/events", [
        'event_id' => $event->id,
    ]);

    $response->assertRedirect();
    assertDatabaseHas('calendar_events', [
        'calendar_id' => $calendar->id,
        'event_id' => $event->id,
    ]);
});

it('allows calendar owners to remove events', function () {
    $user = User::factory()->create();
    $calendar = Calendar::factory()->create(['user_id' => $user->id]);
    $workspace = App\Models\Workspace::factory()->create();
    $event = Event::factory()->create(['workspace_id' => $workspace->id, 'created_by' => $user->id]);
    $calendar->events()->attach($event->id);

    $response = actingAs($user)->delete("/calendars/{$calendar->id}/events/{$event->id}");

    $response->assertRedirect();
    expect($calendar->events()->where('event_id', $event->id)->exists())->toBeFalse();
});

it('allows calendar owners to add editors', function () {
    $owner = User::factory()->create();
    $editor = User::factory()->create();
    $calendar = Calendar::factory()->create(['user_id' => $owner->id]);

    $response = actingAs($owner)->post("/calendars/{$calendar->id}/editors", [
        'email' => $editor->email,
        'role' => 'editor',
    ]);

    $response->assertRedirect();
    assertDatabaseHas('calendar_roles', [
        'calendar_id' => $calendar->id,
        'user_id' => $editor->id,
        'role' => 'editor',
    ]);
});

it('allows editors to update calendars', function () {
    $owner = User::factory()->create();
    $editor = User::factory()->create();
    $calendar = Calendar::factory()->create(['user_id' => $owner->id]);
    $calendar->editors()->attach($editor->id, ['role' => 'editor']);

    $response = actingAs($editor)->put("/calendars/{$calendar->id}", [
        'title' => 'Updated by Editor',
    ]);

    $response->assertRedirect();
    assertDatabaseHas('calendars', [
        'id' => $calendar->id,
        'title' => 'Updated by Editor',
    ]);
});

it('filters calendars by category', function () {
    Calendar::factory()->public()->create(['category' => 'jazz']);
    Calendar::factory()->public()->create(['category' => 'sports']);

    $response = get('/calendars?category=jazz');

    $response->assertSuccessful();
    $response->assertInertia(fn($page) => $page
        ->has('calendars.data', 1));
});

it('searches calendars by title', function () {
    Calendar::factory()->public()->create(['title' => 'Jazz Events Calendar']);
    Calendar::factory()->public()->create(['title' => 'Sports Calendar']);

    $response = get('/calendars?search=Jazz');

    $response->assertSuccessful();
    $response->assertInertia(fn($page) => $page
        ->has('calendars.data', 1));
});

it('filters calendars by price type', function () {
    Calendar::factory()->public()->free()->count(2)->create();
    Calendar::factory()->public()->paid()->count(3)->create();

    $response = get('/calendars?price_type=free');

    $response->assertSuccessful();
    $response->assertInertia(fn($page) => $page
        ->has('calendars.data', 2));
});

it('shows canEdit as true for calendar owners on show page', function () {
    $user = User::factory()->create();
    $calendar = Calendar::factory()->create(['user_id' => $user->id]);

    $response = actingAs($user)->get("/calendars/{$calendar->id}");

    $response->assertSuccessful();
    $response->assertInertia(fn($page) => $page
        ->where('canEdit', true));
});

it('shows canEdit as true for calendar editors on show page', function () {
    $owner = User::factory()->create();
    $editor = User::factory()->create();
    $calendar = Calendar::factory()->create(['user_id' => $owner->id]);
    $calendar->editors()->attach($editor->id, ['role' => 'editor']);

    $response = actingAs($editor)->get("/calendars/{$calendar->id}");

    $response->assertSuccessful();
    $response->assertInertia(fn($page) => $page
        ->where('canEdit', true));
});

it('shows canEdit as false for non-owners and non-editors on show page', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $calendar = Calendar::factory()->create(['user_id' => $owner->id]);

    $response = actingAs($otherUser)->get("/calendars/{$calendar->id}");

    $response->assertSuccessful();
    $response->assertInertia(fn($page) => $page
        ->where('canEdit', false));
});
