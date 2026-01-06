<?php

use App\Models\DayNewsPost;
use App\Models\Workspace;
use App\Models\User;
use App\Models\Tag;
use App\Models\ArticleComment;
use App\Models\Region;

test('can create day news post', function () {
    $workspace = Workspace::factory()->create();
    $user = User::factory()->create();
    
    $post = DayNewsPost::factory()->create([
        'workspace_id' => $workspace->id,
        'author_id' => $user->id,
    ]);
    
    expect($post)->toBeInstanceOf(DayNewsPost::class);
    expect($post->id)->toBeInt(); // Uses integer ID, not UUID
});

test('day news post has required attributes', function () {
    $workspace = Workspace::factory()->create();
    $user = User::factory()->create();
    
    $post = DayNewsPost::factory()->create([
        'workspace_id' => $workspace->id,
        'author_id' => $user->id,
        'title' => 'Test Post',
        'slug' => 'test-post',
        'status' => 'published',
    ]);
    
    expect($post->title)->toBe('Test Post');
    expect($post->slug)->toBe('test-post');
    expect($post->status)->toBe('published');
});

test('day news post belongs to workspace', function () {
    $workspace = Workspace::factory()->create();
    $user = User::factory()->create();
    
    $post = DayNewsPost::factory()->create([
        'workspace_id' => $workspace->id,
        'author_id' => $user->id,
    ]);
    
    expect($post->workspace)->toBeInstanceOf(Workspace::class);
    expect($post->workspace->id)->toBe($workspace->id);
});

test('day news post belongs to author', function () {
    $workspace = Workspace::factory()->create();
    $user = User::factory()->create();
    
    $post = DayNewsPost::factory()->create([
        'workspace_id' => $workspace->id,
        'author_id' => $user->id,
    ]);
    
    expect($post->author)->toBeInstanceOf(User::class);
    expect($post->author->id)->toBe($user->id);
});

test('day news post has comments', function () {
    $workspace = Workspace::factory()->create();
    $user = User::factory()->create();
    $post = DayNewsPost::factory()->create([
        'workspace_id' => $workspace->id,
        'author_id' => $user->id,
    ]);
    
    ArticleComment::factory()->create([
        'article_id' => $post->id,
        'user_id' => $user->id,
    ]);
    
    expect($post->comments)->toHaveCount(1);
});

test('day news post has tags', function () {
    $workspace = Workspace::factory()->create();
    $user = User::factory()->create();
    $post = DayNewsPost::factory()->create([
        'workspace_id' => $workspace->id,
        'author_id' => $user->id,
    ]);
    
    $tag1 = Tag::factory()->create();
    $tag2 = Tag::factory()->create();
    
    $post->tags()->attach([$tag1->id, $tag2->id]);
    
    expect($post->tags)->toHaveCount(2);
});

test('day news post has regions', function () {
    $workspace = Workspace::factory()->create();
    $user = User::factory()->create();
    $post = DayNewsPost::factory()->create([
        'workspace_id' => $workspace->id,
        'author_id' => $user->id,
    ]);
    
    $region1 = Region::factory()->create();
    $region2 = Region::factory()->create();
    
    $post->regions()->attach([$region1->id, $region2->id]);
    
    expect($post->regions)->toHaveCount(2);
});

test('day news post published scope works', function () {
    $workspace = Workspace::factory()->create();
    $user = User::factory()->create();
    
    DayNewsPost::factory()->create([
        'workspace_id' => $workspace->id,
        'author_id' => $user->id,
        'status' => 'published',
        'published_at' => now(),
    ]);
    
    DayNewsPost::factory()->create([
        'workspace_id' => $workspace->id,
        'author_id' => $user->id,
        'status' => 'draft',
    ]);
    
    $published = DayNewsPost::published()->get();
    
    expect($published->count())->toBeGreaterThanOrEqual(1);
});
