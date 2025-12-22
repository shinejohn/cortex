<?php

declare(strict_types=1);

use App\Models\Hub;
use App\Models\HubSection;
use App\Models\HubMember;
use App\Models\HubRole;
use App\Models\HubAnalytics;
use App\Models\User;
use App\Models\Workspace;
use App\Models\Event;

test('can view hubs index page', function () {
    $response = $this->get('/hubs');
    $response->assertStatus(200);
});

test('authenticated user can create hub', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $user->workspaces()->attach($workspace->id, ['role' => 'owner']);

    $this->actingAs($user);

    $hubData = [
        'name' => 'Test Hub',
        'description' => 'Test Description',
        'category' => 'music',
        'workspace_id' => $workspace->id,
    ];

    $response = $this->post('/hubs', $hubData);
    $response->assertRedirect();
    
    $this->assertDatabaseHas('hubs', [
        'name' => 'Test Hub',
        'workspace_id' => $workspace->id,
        'created_by' => $user->id,
    ]);
});

test('can view hub detail page', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $hub = Hub::factory()->create([
        'workspace_id' => $workspace->id,
        'created_by' => $user->id,
        'slug' => 'test-hub',
        'is_active' => true,
        'published_at' => now(),
    ]);

    $response = $this->get("/hubs/{$hub->slug}");
    $response->assertStatus(200);
});

test('hub owner can update hub', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $hub = Hub::factory()->create([
        'workspace_id' => $workspace->id,
        'created_by' => $user->id,
    ]);

    $this->actingAs($user);

    $response = $this->put("/hubs/{$hub->id}", [
        'name' => 'Updated Hub Name',
        'description' => 'Updated Description',
    ]);

    $response->assertRedirect();
    
    $this->assertDatabaseHas('hubs', [
        'id' => $hub->id,
        'name' => 'Updated Hub Name',
    ]);
});

test('hub owner can access hub builder', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $hub = Hub::factory()->create([
        'workspace_id' => $workspace->id,
        'created_by' => $user->id,
    ]);

    $this->actingAs($user);

    $response = $this->get("/hubs/{$hub->id}/builder");
    $response->assertStatus(200);
});

test('hub owner can update hub sections', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $hub = Hub::factory()->create([
        'workspace_id' => $workspace->id,
        'created_by' => $user->id,
    ]);

    $this->actingAs($user);

    $sectionsData = [
        'sections' => [
            [
                'type' => 'hero',
                'content' => ['title' => 'Welcome'],
                'order' => 1,
            ],
            [
                'type' => 'events',
                'content' => ['title' => 'Upcoming Events'],
                'order' => 2,
            ],
        ],
    ];

    $response = $this->post("/hubs/{$hub->id}/builder/sections", $sectionsData);
    $response->assertRedirect();
    
    $this->assertDatabaseHas('hub_sections', [
        'hub_id' => $hub->id,
        'type' => 'hero',
    ]);
});

test('hub owner can view hub analytics', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $hub = Hub::factory()->create([
        'workspace_id' => $workspace->id,
        'created_by' => $user->id,
    ]);

    $this->actingAs($user);

    $response = $this->get("/hubs/{$hub->id}/analytics");
    $response->assertStatus(200);
});

test('can track hub page view', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $hub = Hub::factory()->create([
        'workspace_id' => $workspace->id,
        'created_by' => $user->id,
        'is_active' => true,
        'published_at' => now(),
    ]);

    $this->actingAs($user);

    $response = $this->post("/api/hubs/{$hub->id}/analytics/track-view");
    $response->assertStatus(200);
    
    $this->assertDatabaseHas('hub_analytics', [
        'hub_id' => $hub->id,
        'date' => now()->toDateString(),
    ]);
});

test('hub can have members', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $hub = Hub::factory()->create([
        'workspace_id' => $workspace->id,
        'created_by' => $user->id,
    ]);

    $member = User::factory()->create();
    
    HubMember::create([
        'hub_id' => $hub->id,
        'user_id' => $member->id,
        'role' => 'member',
    ]);

    $this->assertDatabaseHas('hub_members', [
        'hub_id' => $hub->id,
        'user_id' => $member->id,
    ]);
    
    expect($hub->members)->toHaveCount(1);
});

test('hub can have roles', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $hub = Hub::factory()->create([
        'workspace_id' => $workspace->id,
        'created_by' => $user->id,
    ]);

    $role = HubRole::create([
        'hub_id' => $hub->id,
        'name' => 'Moderator',
        'permissions' => ['manage_events', 'manage_members'],
    ]);

    $this->assertDatabaseHas('hub_roles', [
        'hub_id' => $hub->id,
        'name' => 'Moderator',
    ]);
    
    expect($hub->roles)->toHaveCount(1);
});

test('hub owner can delete hub', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();
    $hub = Hub::factory()->create([
        'workspace_id' => $workspace->id,
        'created_by' => $user->id,
    ]);

    $this->actingAs($user);

    $response = $this->delete("/hubs/{$hub->id}");
    $response->assertRedirect();
    
    $this->assertDatabaseMissing('hubs', [
        'id' => $hub->id,
    ]);
});
