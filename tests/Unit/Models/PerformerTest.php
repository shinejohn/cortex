<?php

use App\Models\Performer;
use App\Models\Workspace;
use App\Models\Event;

test('can create performer', function () {
    $workspace = Workspace::factory()->create();
    $performer = Performer::factory()->create(['workspace_id' => $workspace->id]);
    
    expect($performer)->toBeInstanceOf(Performer::class);
    expect($performer->id)->toBeString();
});

test('performer has required attributes', function () {
    $workspace = Workspace::factory()->create();
    $performer = Performer::factory()->create([
        'workspace_id' => $workspace->id,
        'name' => 'Test Performer',
        'slug' => 'test-performer',
    ]);
    
    expect($performer->name)->toBe('Test Performer');
    expect($performer->slug)->toBe('test-performer');
});

test('performer belongs to workspace', function () {
    $workspace = Workspace::factory()->create();
    $performer = Performer::factory()->create(['workspace_id' => $workspace->id]);
    
    expect($performer->workspace)->toBeInstanceOf(Workspace::class);
    expect($performer->workspace->id)->toBe($workspace->id);
});

test('performer has events', function () {
    $workspace = Workspace::factory()->create();
    $performer = Performer::factory()->create(['workspace_id' => $workspace->id]);
    
    Event::factory()->create([
        'workspace_id' => $workspace->id,
        'performer_id' => $performer->id,
    ]);
    
    expect($performer->events)->toHaveCount(1);
});
