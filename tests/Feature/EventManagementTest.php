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
    $performer = Performer::factory()->create([
        'name' => 'Test Band',
        'is_verified' => true,
        'available_for_booking' => true,
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
    $venue = Venue::factory()->create();
    $performer = Performer::factory()->create();

    $event = Event::factory()->create([
        'title' => 'Test Event',
        'venue_id' => $venue->id,
        'performer_id' => $performer->id,
        'status' => 'published',
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
    Performer::factory()->create(['status' => 'active', 'available_for_booking' => true]);
    Performer::factory()->create(['status' => 'inactive', 'available_for_booking' => false]);
    Performer::factory()->create(['status' => 'active', 'available_for_booking' => false]);

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
