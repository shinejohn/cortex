<?php

use App\Models\Event;
use App\Models\Venue;
use App\Models\Performer;
use App\Models\User;
use App\Models\Workspace;
use App\Models\TicketPlan;

test('can create event', function () {
    $workspace = Workspace::factory()->create();
    $event = Event::factory()->create(['workspace_id' => $workspace->id]);
    
    expect($event)->toBeInstanceOf(Event::class);
    expect($event->id)->toBeString();
});

test('event has required attributes', function () {
    $workspace = Workspace::factory()->create();
    $event = Event::factory()->create([
        'workspace_id' => $workspace->id,
        'title' => 'Test Event',
        'slug' => 'test-event',
    ]);
    
    expect($event->title)->toBe('Test Event');
    expect($event->slug)->toBe('test-event');
    expect($event->workspace_id)->toBe($workspace->id);
});

test('event belongs to workspace', function () {
    $workspace = Workspace::factory()->create();
    $event = Event::factory()->create(['workspace_id' => $workspace->id]);
    
    expect($event->workspace)->toBeInstanceOf(Workspace::class);
    expect($event->workspace->id)->toBe($workspace->id);
});

test('event belongs to venue', function () {
    $workspace = Workspace::factory()->create();
    $venue = Venue::factory()->create(['workspace_id' => $workspace->id]);
    $event = Event::factory()->create([
        'workspace_id' => $workspace->id,
        'venue_id' => $venue->id,
    ]);
    
    expect($event->venue)->toBeInstanceOf(Venue::class);
    expect($event->venue->id)->toBe($venue->id);
});

test('event belongs to performer', function () {
    $workspace = Workspace::factory()->create();
    $performer = Performer::factory()->create(['workspace_id' => $workspace->id]);
    $event = Event::factory()->create([
        'workspace_id' => $workspace->id,
        'performer_id' => $performer->id,
    ]);
    
    expect($event->performer)->toBeInstanceOf(Performer::class);
    expect($event->performer->id)->toBe($performer->id);
});

test('event has ticket plans', function () {
    $workspace = Workspace::factory()->create();
    $event = Event::factory()->create(['workspace_id' => $workspace->id]);
    
    TicketPlan::factory()->create(['event_id' => $event->id]);
    TicketPlan::factory()->create(['event_id' => $event->id]);
    
    expect($event->ticketPlans)->toHaveCount(2);
});

test('event slug is unique per workspace', function () {
    $workspace = Workspace::factory()->create();
    Event::factory()->create(['slug' => 'test-event', 'workspace_id' => $workspace->id]);
    
    expect(function () use ($workspace) {
        Event::factory()->create(['slug' => 'test-event', 'workspace_id' => $workspace->id]);
    })->toThrow(Illuminate\Database\QueryException::class);
});
