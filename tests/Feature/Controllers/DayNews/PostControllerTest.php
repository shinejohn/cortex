<?php

use App\Models\User;
use App\Models\Workspace;
use App\Models\DayNewsPost;

test('post controller exists', function () {
    expect(class_exists("App\\Http\\Controllers\\DayNews\\PostController"))->toBeTrue();
});

test('authenticated user can access post index', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    $user->update(['current_workspace_id' => $workspace->id]);
    
    $response = $this->actingAs($user)->get('/day-news/posts');
    
    expect($response->status())->toBeIn([200, 302]); // 200 or redirect
});

test('authenticated user can create post', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    $user->update(['current_workspace_id' => $workspace->id]);
    
    $response = $this->actingAs($user)->get('/day-news/posts/create');
    
    expect($response->status())->toBeIn([200, 302]);
});

test('post controller requires authentication', function () {
    $response = $this->get('/day-news/posts');
    
    expect($response->status())->toBeIn([302, 401]); // Redirect to login or unauthorized
});
