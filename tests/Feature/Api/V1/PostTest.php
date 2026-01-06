<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1;

use App\Models\DayNewsPost;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class PostTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_list_posts(): void
    {
        $user = User::factory()->create();
        $workspace = Workspace::factory()->create();
        DayNewsPost::factory()->count(5)->create(['workspace_id' => $workspace->id]);

        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/posts');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data',
                'meta',
            ]);
    }

    public function test_user_can_create_post(): void
    {
        $user = User::factory()->create();
        $workspace = Workspace::factory()->create();
        
        // Ensure user is a member of the workspace
        $workspace->members()->create([
            'user_id' => $user->id,
            'role' => 'member',
        ]);
        
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/posts', [
                'workspace_id' => $workspace->id,
                'title' => 'Test Post',
                'content' => 'This is a test post',
                'status' => 'draft',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data',
            ]);

        $this->assertDatabaseHas('day_news_posts', [
            'title' => 'Test Post',
        ]);
    }

    public function test_user_can_view_post(): void
    {
        $user = User::factory()->create();
        $workspace = Workspace::factory()->create();
        $post = DayNewsPost::factory()->create(['workspace_id' => $workspace->id]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/v1/posts/{$post->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'title',
                    'content',
                ],
            ]);
    }
}

