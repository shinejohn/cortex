<?php

use App\Models\Venue;
use App\Models\Workspace;
use App\Models\Event;

test('can create venue', function () {
    $workspace = Workspace::factory()->create();
    $venue = Venue::factory()->create(['workspace_id' => $workspace->id]);
    
    expect($venue)->toBeInstanceOf(Venue::class);
    expect($venue->id)->toBeString();
});

test('venue has required attributes', function () {
    $workspace = Workspace::factory()->create();
    $venue = Venue::factory()->create([
        'workspace_id' => $workspace->id,
        'name' => 'Test Venue',
        'slug' => 'test-venue',
    ]);
    
    expect($venue->name)->toBe('Test Venue');
    expect($venue->slug)->toBe('test-venue');
});

test('venue belongs to workspace', function () {
    $workspace = Workspace::factory()->create();
    $venue = Venue::factory()->create(['workspace_id' => $workspace->id]);
    
    expect($venue->workspace)->toBeInstanceOf(Workspace::class);
    expect($venue->workspace->id)->toBe($workspace->id);
});

test('venue has events', function () {
    $workspace = Workspace::factory()->create();
    $venue = Venue::factory()->create(['workspace_id' => $workspace->id]);
    
    Event::factory()->create([
        'workspace_id' => $workspace->id,
        'venue_id' => $venue->id,
    ]);
    
    expect($venue->events)->toHaveCount(1);
});
