<?php

declare(strict_types=1);

use App\Models\AiCreatorSession;
use App\Models\Region;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('creates ai creator session when authenticated', function () {
    $region = Region::factory()->create();

    $response = $this->actingAs($this->user)
        ->postJson('/api/v1/ai-creator/sessions', [
            'content_type' => 'article',
            'region_id' => $region->id,
        ]);

    $response->assertCreated();
    $response->assertJsonStructure(['success', 'data' => ['id', 'user_id', 'region_id', 'content_type', 'status']]);
    $response->assertJson(['success' => true, 'data' => ['content_type' => 'article', 'status' => 'active']]);

    $this->assertDatabaseHas('ai_creator_sessions', [
        'user_id' => $this->user->id,
        'region_id' => $region->id,
        'content_type' => 'article',
        'status' => 'active',
    ]);
});

it('rejects session creation when unauthenticated', function () {
    $response = $this->postJson('/api/v1/ai-creator/sessions', [
        'content_type' => 'article',
    ]);

    $response->assertUnauthorized();
});

it('rejects analyze when session belongs to another user', function () {
    $otherUser = User::factory()->create();
    $session = AiCreatorSession::factory()->create(['user_id' => $otherUser->id]);

    $response = $this->actingAs($this->user)
        ->postJson("/api/v1/ai-creator/sessions/{$session->id}/analyze", [
            'title' => 'Test',
            'content' => 'Test content here',
        ]);

    $response->assertForbidden();
});
