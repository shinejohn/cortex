<?php

declare(strict_types=1);

use App\Models\Event;
use App\Models\Region;
use App\Services\News\EventDeduplicationService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->service = app(EventDeduplicationService::class);
    $this->region = Region::factory()->create();
});

it('returns null when no duplicate exists', function () {
    $eventData = [
        'title' => 'Summer Jazz Festival',
        'event_date' => now()->addDays(7)->format('Y-m-d'),
        'venue_name' => 'City Park',
        'source_url' => 'https://example.com/event/123',
    ];

    $duplicate = $this->service->findDuplicate($eventData, $this->region->id);

    expect($duplicate)->toBeNull();
});

it('finds duplicate by source_url', function () {
    $event = Event::factory()->create([
        'source_url' => 'https://example.com/event/123',
        'title' => 'Summer Jazz Festival',
    ]);
    $event->regions()->attach($this->region->id);

    $eventData = [
        'title' => 'Summer Jazz Festival',
        'event_date' => now()->addDays(7)->format('Y-m-d'),
        'source_url' => 'https://example.com/event/123',
    ];

    $duplicate = $this->service->findDuplicate($eventData, $this->region->id);

    expect($duplicate)->not->toBeNull()
        ->and($duplicate->id)->toBe($event->id);
});

it('finds duplicate by external_id', function () {
    $event = Event::factory()->create([
        'external_id' => 'evt_abc123',
        'title' => 'Meetup Event',
    ]);
    $event->regions()->attach($this->region->id);

    $eventData = [
        'title' => 'Meetup Event',
        'event_date' => now()->addDays(5)->format('Y-m-d'),
        'external_id' => 'evt_abc123',
    ];

    $duplicate = $this->service->findDuplicate($eventData, $this->region->id);

    expect($duplicate)->not->toBeNull()
        ->and($duplicate->id)->toBe($event->id);
});

it('generates consistent content hash for same event data', function () {
    $eventData = [
        'title' => 'Concert Night',
        'event_date' => '2025-03-15',
        'venue_name' => 'Grand Hall',
        'source_url' => 'https://tickets.com/event/1',
    ];

    $hash1 = $this->service->generateContentHash($eventData);
    $hash2 = $this->service->generateContentHash($eventData);

    expect($hash1)->toBe($hash2)
        ->and(mb_strlen($hash1))->toBe(64);
});
