<?php

use App\Services\EventService;
use App\Models\Event;
use App\Models\Workspace;
use App\Models\Venue;

test('event service can be instantiated', function () {
    $service = app(EventService::class);
    expect($service)->toBeInstanceOf(EventService::class);
});

test('event service can create event', function () {
    $workspace = Workspace::factory()->create();
    $service = app(EventService::class);
    
    $event = Event::factory()->create(['workspace_id' => $workspace->id]);
    
    expect($event)->toBeInstanceOf(Event::class);
    expect($service)->toBeInstanceOf(EventService::class);
});

test('event service can find events', function () {
    $workspace = Workspace::factory()->create();
    Event::factory()->count(3)->create(['workspace_id' => $workspace->id]);
    
    $events = Event::where('workspace_id', $workspace->id)->get();
    
    expect($events)->toHaveCount(3);
});
