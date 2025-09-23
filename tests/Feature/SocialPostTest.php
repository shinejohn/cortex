<?php

declare(strict_types=1);

use App\Models\SocialPost;
use App\Models\User;

test('authenticated user can access social feed', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/social');

    $response->assertStatus(200);
});

test('user can create a social post', function () {
    $user = User::factory()->create();

    $postData = [
        'content' => 'This is a test post',
        'visibility' => 'public',
    ];

    $response = $this->actingAs($user)->withoutMiddleware()->postJson('/social/posts', $postData);

    $response->assertStatus(200);

    $this->assertDatabaseHas('social_posts', [
        'user_id' => $user->id,
        'content' => 'This is a test post',
        'visibility' => 'public',
    ]);
});

test('user can like a post', function () {
    $user = User::factory()->create();
    $post = SocialPost::factory()->create();

    $response = $this->actingAs($user)->withoutMiddleware()->post("/social/posts/{$post->id}/like");

    $response->assertStatus(200);

    $this->assertDatabaseHas('social_post_likes', [
        'user_id' => $user->id,
        'post_id' => $post->id,
    ]);
});

test('user can comment on a post', function () {
    $user = User::factory()->create();
    $post = SocialPost::factory()->create();

    $commentData = [
        'content' => 'This is a test comment',
    ];

    $response = $this->actingAs($user)->withoutMiddleware()->postJson("/social/posts/{$post->id}/comments", $commentData);

    $response->assertStatus(200);

    $this->assertDatabaseHas('social_post_comments', [
        'user_id' => $user->id,
        'post_id' => $post->id,
        'content' => 'This is a test comment',
    ]);
});

test('user cannot create post without content', function () {
    $user = User::factory()->create();

    $postData = [
        'visibility' => 'public',
    ];

    $response = $this->actingAs($user)->withoutMiddleware()->postJson('/social/posts', $postData);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['content']);
});

test('unauthenticated user cannot access social features', function () {
    $response = $this->get('/social');
    $response->assertRedirect('/login');

    $response = $this->postJson('/social/posts', ['content' => 'test']);
    $response->assertStatus(419); // CSRF token mismatch
});
