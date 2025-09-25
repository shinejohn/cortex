<?php

declare(strict_types=1);

use App\Models\SocialPost;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

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

test('user can upload image for post', function () {
    Storage::fake('public');
    $user = User::factory()->create();

    $file = UploadedFile::fake()->image('test.jpg', 800, 600);

    $response = $this->actingAs($user)->withoutMiddleware()->postJson('/social/images/upload', [
        'image' => $file,
    ]);

    $response->assertStatus(200);
    $response->assertJsonStructure(['url', 'path']);

    // Get the returned path and assert it exists
    $path = $response->json('path');
    Storage::disk('public')->assertExists($path);
});

test('user can create post with images', function () {
    $user = User::factory()->create();

    $postData = [
        'content' => 'This is a test post with images',
        'visibility' => 'public',
        'media' => ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    ];

    $response = $this->actingAs($user)->withoutMiddleware()->postJson('/social/posts', $postData);

    $response->assertStatus(200);

    $this->assertDatabaseHas('social_posts', [
        'user_id' => $user->id,
        'content' => 'This is a test post with images',
        'visibility' => 'public',
    ]);

    $post = SocialPost::where('user_id', $user->id)->first();
    expect($post->media)->toEqual(['https://example.com/image1.jpg', 'https://example.com/image2.jpg']);
});

test('image upload rejects non-image files', function () {
    $user = User::factory()->create();

    $file = UploadedFile::fake()->create('document.pdf', 1024, 'application/pdf');

    $response = $this->actingAs($user)->withoutMiddleware()->postJson('/social/images/upload', [
        'image' => $file,
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['image']);
});

test('image upload rejects large files', function () {
    Storage::fake('public');
    $user = User::factory()->create();

    // Create file larger than 2MB (2048 KB)
    $file = UploadedFile::fake()->image('large.jpg')->size(3000);

    $response = $this->actingAs($user)->withoutMiddleware()->postJson('/social/images/upload', [
        'image' => $file,
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['image']);
});
