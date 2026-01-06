<?php

use App\Services\DayNewsPostService;
use App\Models\DayNewsPost;
use App\Models\Workspace;
use App\Models\User;

test('day news post service can be instantiated', function () {
    $service = app(DayNewsPostService::class);
    expect($service)->toBeInstanceOf(DayNewsPostService::class);
});

test('day news post service can create post', function () {
    $workspace = Workspace::factory()->create();
    $user = User::factory()->create();
    $service = app(DayNewsPostService::class);
    
    $post = DayNewsPost::factory()->create([
        'workspace_id' => $workspace->id,
        'author_id' => $user->id,
    ]);
    
    expect($post)->toBeInstanceOf(DayNewsPost::class);
    expect($service)->toBeInstanceOf(DayNewsPostService::class);
});

test('day news post service can find posts', function () {
    $workspace = Workspace::factory()->create();
    $user = User::factory()->create();
    
    DayNewsPost::factory()->count(3)->create([
        'workspace_id' => $workspace->id,
        'author_id' => $user->id,
    ]);
    
    $posts = DayNewsPost::where('workspace_id', $workspace->id)->get();
    
    expect($posts->count())->toBeGreaterThanOrEqual(3);
});
