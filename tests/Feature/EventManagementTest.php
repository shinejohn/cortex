<?php

declare(strict_types=1);

use App\Models\Booking;
use App\Models\Event;
use App\Models\Performer;
use App\Models\UpcomingShow;
use App\Models\Venue;

test('venues can be created with proper attributes', function () {
    $venue = Venue::factory()->create([
        'name' => 'Test Venue',
        'capacity' => 100,
        'verified' => true,
        'status' => 'active',
    ]);

    expect($venue)
        ->name->toBe('Test Venue')
        ->capacity->toBe(100)
        ->verified->toBeTrue()
        ->status->toBe('active');

    expect($venue->location)->toBeArray();
    expect($venue->pricing)->toBeArray();
});

test('performers can be created with upcoming shows', function () {
    $workspace = App\Models\Workspace::factory()->create();
    $user = App\Models\User::factory()->create(['current_workspace_id' => $workspace->id]);

    $performer = Performer::factory()->create([
        'name' => 'Test Band',
        'is_verified' => true,
        'available_for_booking' => true,
        'workspace_id' => $workspace->id,
        'created_by' => $user->id,
    ]);

    $upcomingShow = UpcomingShow::factory()->create([
        'performer_id' => $performer->id,
        'venue' => 'Test Venue',
        'tickets_available' => true,
    ]);

    expect($performer)
        ->name->toBe('Test Band')
        ->is_verified->toBeTrue()
        ->available_for_booking->toBeTrue();

    expect($performer->upcomingShows)->toHaveCount(1);
    expect($performer->upcomingShows->first()->venue)->toBe('Test Venue');
});

test('events can be created with venues and performers', function () {
    $workspace = App\Models\Workspace::factory()->create();
    $user = App\Models\User::factory()->create(['current_workspace_id' => $workspace->id]);

    $venue = Venue::factory()->create([
        'workspace_id' => $workspace->id,
        'created_by' => $user->id,
    ]);
    $performer = Performer::factory()->create([
        'workspace_id' => $workspace->id,
        'created_by' => $user->id,
    ]);

    $event = Event::factory()->create([
        'title' => 'Test Event',
        'venue_id' => $venue->id,
        'performer_id' => $performer->id,
        'status' => 'published',
        'workspace_id' => $workspace->id,
        'created_by' => $user->id,
    ]);

    expect($event)
        ->title->toBe('Test Event')
        ->status->toBe('published');

    expect($event->venue)->not->toBeNull();
    expect($event->performer)->not->toBeNull();
    expect($event->venue->id)->toBe($venue->id);
    expect($event->performer->id)->toBe($performer->id);
});

test('bookings can be created for different types', function () {
    $venue = Venue::factory()->create();
    $performer = Performer::factory()->create();
    $event = Event::factory()->create();

    // Test venue booking
    $venueBooking = Booking::factory()->venueBooking()->create([
        'venue_id' => $venue->id,
        'contact_name' => 'John Doe',
    ]);

    expect($venueBooking)
        ->booking_type->toBe('venue')
        ->contact_name->toBe('John Doe')
        ->isVenueBooking()->toBeTrue();

    // Test performer booking
    $performerBooking = Booking::factory()->performerBooking()->create([
        'performer_id' => $performer->id,
    ]);

    expect($performerBooking)
        ->booking_type->toBe('performer')
        ->isPerformerBooking()->toBeTrue();

    // Test event booking
    $eventBooking = Booking::factory()->eventBooking()->create([
        'event_id' => $event->id,
    ]);

    expect($eventBooking)
        ->booking_type->toBe('event')
        ->isEventBooking()->toBeTrue();
});

test('booking numbers are automatically generated', function () {
    $booking = Booking::factory()->create();

    expect($booking->booking_number)
        ->toStartWith('BK-')
        ->toHaveLength(11); // BK- + 8 characters
});

test('venue scopes work correctly', function () {
    Venue::factory()->create(['status' => 'active', 'verified' => true]);
    Venue::factory()->create(['status' => 'inactive', 'verified' => false]);
    Venue::factory()->create(['status' => 'active', 'verified' => false]);

    expect(Venue::active()->count())->toBe(2);
    expect(Venue::verified()->count())->toBe(1);
    expect(Venue::active()->verified()->count())->toBe(1);
});

test('performer scopes work correctly', function () {
    $workspace = App\Models\Workspace::factory()->create();
    $user = App\Models\User::factory()->create(['current_workspace_id' => $workspace->id]);

    Performer::factory()->create([
        'status' => 'active',
        'available_for_booking' => true,
        'workspace_id' => $workspace->id,
        'created_by' => $user->id,
    ]);
    Performer::factory()->create([
        'status' => 'inactive',
        'available_for_booking' => false,
        'workspace_id' => $workspace->id,
        'created_by' => $user->id,
    ]);
    Performer::factory()->create([
        'status' => 'active',
        'available_for_booking' => false,
        'workspace_id' => $workspace->id,
        'created_by' => $user->id,
    ]);

    expect(Performer::active()->count())->toBe(2);
    expect(Performer::availableForBooking()->count())->toBe(1);
});

test('event scopes work correctly', function () {
    Event::factory()->create(['status' => 'published', 'event_date' => now()->addDays(1)]);
    Event::factory()->create(['status' => 'draft', 'event_date' => now()->addDays(2)]);
    Event::factory()->create(['status' => 'published', 'event_date' => now()->subDays(1)]);

    expect(Event::published()->count())->toBe(2);
    expect(Event::upcoming()->count())->toBe(2);
    expect(Event::published()->upcoming()->count())->toBe(1);
});

test('venues display their connected events', function () {
    $workspace = App\Models\Workspace::factory()->create();
    $user = App\Models\User::factory()->create(['current_workspace_id' => $workspace->id]);

    $venue = Venue::factory()->create([
        'workspace_id' => $workspace->id,
        'created_by' => $user->id,
    ]);

    // Create multiple events at this venue
    Event::factory()->count(3)->create([
        'venue_id' => $venue->id,
        'workspace_id' => $workspace->id,
        'created_by' => $user->id,
        'status' => 'published',
    ]);

    $venue->load('events');

    expect($venue->events)->toHaveCount(3);
    expect($venue->events->first()->venue_id)->toBe($venue->id);
});

test('performers display their connected events', function () {
    $workspace = App\Models\Workspace::factory()->create();
    $user = App\Models\User::factory()->create(['current_workspace_id' => $workspace->id]);

    $performer = Performer::factory()->create([
        'workspace_id' => $workspace->id,
        'created_by' => $user->id,
    ]);

    // Create multiple events with this performer
    Event::factory()->count(2)->create([
        'performer_id' => $performer->id,
        'workspace_id' => $workspace->id,
        'created_by' => $user->id,
        'status' => 'published',
    ]);

    $performer->load('events');

    expect($performer->events)->toHaveCount(2);
    expect($performer->events->first()->performer_id)->toBe($performer->id);
});

test('events can have both venue and performer', function () {
    $workspace = App\Models\Workspace::factory()->create();
    $user = App\Models\User::factory()->create(['current_workspace_id' => $workspace->id]);

    $venue = Venue::factory()->create([
        'workspace_id' => $workspace->id,
        'created_by' => $user->id,
    ]);
    $performer = Performer::factory()->create([
        'workspace_id' => $workspace->id,
        'created_by' => $user->id,
    ]);

    $event = Event::factory()->create([
        'venue_id' => $venue->id,
        'performer_id' => $performer->id,
        'workspace_id' => $workspace->id,
        'created_by' => $user->id,
    ]);

    $event->load(['venue', 'performer']);

    expect($event->venue)->not->toBeNull();
    expect($event->performer)->not->toBeNull();
    expect($event->venue->name)->toBe($venue->name);
    expect($event->performer->name)->toBe($performer->name);
});

test('venues and performers are independent entities', function () {
    $workspace = App\Models\Workspace::factory()->create();
    $user = App\Models\User::factory()->create(['current_workspace_id' => $workspace->id]);

    $venue = Venue::factory()->create([
        'workspace_id' => $workspace->id,
        'created_by' => $user->id,
    ]);
    $performer = Performer::factory()->create([
        'workspace_id' => $workspace->id,
        'created_by' => $user->id,
    ]);

    // Both can exist independently
    expect($venue)->not->toBeNull();
    expect($performer)->not->toBeNull();

    // Neither has a direct relationship to the other
    expect($venue)->not->toHaveProperty('performer_id');
    expect($performer)->not->toHaveProperty('venue_id');
});
