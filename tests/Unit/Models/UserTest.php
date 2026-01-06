<?php

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMembership;
use App\Models\SocialAccount;
use Illuminate\Support\Facades\Hash;

test('can create user', function () {
    $user = User::factory()->create();
    expect($user)->toBeInstanceOf(User::class);
    expect($user->id)->toBeString(); // UUIDs are strings
});

test('user has required attributes', function () {
    $user = User::factory()->create([
        'name' => 'Test User',
        'email' => 'test@example.com',
    ]);
    
    expect($user->name)->toBe('Test User');
    expect($user->email)->toBe('test@example.com');
    expect($user->id)->toBeString();
});

test('user password is hashed', function () {
    $user = User::factory()->create([
        'password' => 'plain-password',
    ]);
    
    expect(Hash::check('plain-password', $user->password))->toBeTrue();
});

test('user has workspaces relationship', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    
    // User.workspaces() returns WorkspaceMembership, not Workspace
    // So we need to create a membership
    WorkspaceMembership::factory()->create([
        'user_id' => $user->id,
        'workspace_id' => $workspace->id,
    ]);
    
    $user->refresh();
    expect($user->workspaces)->toHaveCount(1);
});

test('user has current workspace relationship', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    $user->update(['current_workspace_id' => $workspace->id]);
    
    expect($user->currentWorkspace)->toBeInstanceOf(Workspace::class);
    expect($user->currentWorkspace->id)->toBe($workspace->id);
});

test('user has social accounts relationship', function () {
    $user = User::factory()->create();
    $socialAccount = SocialAccount::factory()->create(['user_id' => $user->id]);
    
    $user->refresh();
    expect($user->socialAccounts)->toHaveCount(1);
    expect($user->socialAccounts->first()->id)->toBe($socialAccount->id);
});

test('user has avatar attribute', function () {
    $user = User::factory()->create();
    
    expect($user->avatar)->toBeString();
    expect($user->avatar)->toContain('dicebear.com');
});

test('user can have multiple workspace memberships', function () {
    $user = User::factory()->create();
    $workspace1 = Workspace::factory()->create(['owner_id' => $user->id]);
    $workspace2 = Workspace::factory()->create(['owner_id' => $user->id]);
    
    WorkspaceMembership::factory()->create([
        'user_id' => $user->id,
        'workspace_id' => $workspace1->id,
    ]);
    WorkspaceMembership::factory()->create([
        'user_id' => $user->id,
        'workspace_id' => $workspace2->id,
    ]);
    
    expect($user->workspaceMemberships)->toHaveCount(2);
});
