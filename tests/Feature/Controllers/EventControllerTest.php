<?php

use App\Models\User;
use App\Models\Workspace;
use App\Models\Event;

test('event controller exists', function () {
    expect(class_exists("App\\Http\\Controllers\\EventController"))->toBeTrue();
});

test('authenticated user can access events', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    $user->update(['current_workspace_id' => $workspace->id]);
    
    $response = $this->actingAs($user)->get('/events');
    
    expect($response->status())->toBeIn([200, 302]);
});

test('event controller requires authentication', function () {
    $response = $this->get('/events');
    
    expect($response->status())->toBeIn([302, 401]);
});
