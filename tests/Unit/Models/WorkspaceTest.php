<?php

use App\Models\Workspace;
use App\Models\User;
use App\Models\WorkspaceMembership;

test('can create workspace', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    
    expect($workspace)->toBeInstanceOf(Workspace::class);
    expect($workspace->id)->toBeString();
    expect($workspace->owner_id)->toBe($user->id);
});

test('workspace has required attributes', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create([
        'owner_id' => $user->id,
        'name' => 'Test Workspace',
        'slug' => 'test-workspace',
    ]);
    
    expect($workspace->name)->toBe('Test Workspace');
    expect($workspace->slug)->toBe('test-workspace');
});

test('workspace belongs to owner', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    
    expect($workspace->owner)->toBeInstanceOf(User::class);
    expect($workspace->owner->id)->toBe($user->id);
});

test('workspace has memberships', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    
    WorkspaceMembership::factory()->create([
        'workspace_id' => $workspace->id,
        'user_id' => $user->id,
    ]);
    
    expect($workspace->memberships)->toHaveCount(1);
});

test('workspace slug is unique', function () {
    $user = User::factory()->create();
    Workspace::factory()->create(['slug' => 'test-slug', 'owner_id' => $user->id]);
    
    expect(function () use ($user) {
        Workspace::factory()->create(['slug' => 'test-slug', 'owner_id' => $user->id]);
    })->toThrow(Illuminate\Database\QueryException::class);
});
