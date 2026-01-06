<?php

declare(strict_types=1);

namespace Tests\Integration\Api\V1\Scenarios;

use App\Models\Region;
use App\Models\Tag;
use App\Models\User;
use App\Models\Workspace;
use Tests\Integration\Api\V1\IntegrationTestCase;

/**
 * Integration Test: Complete User Registration and First Post Workflow
 * 
 * This test simulates a real-world scenario where:
 * 1. A new user registers
 * 2. Creates a workspace
 * 3. Publishes their first post with regions and tags
 * 4. Receives engagement (comments)
 */
final class UserRegistrationWorkflowTest extends IntegrationTestCase
{
    public function test_complete_user_registration_and_first_post_workflow(): void
    {
        // Step 1: Register new user
        $registerResponse = $this->postJson('/api/v1/auth/register', [
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

        $registerResponse->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'user' => ['id', 'name', 'email'],
                    'token',
                ],
            ]);

        $token = $registerResponse->json('data.token');
        $userId = $registerResponse->json('data.user.id');

        // Step 2: Create workspace
        $workspaceResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/workspaces', [
                'name' => 'My Workspace',
                'slug' => 'my-workspace',
            ]);

        $workspaceResponse->assertStatus(201);
        $workspaceId = $workspaceResponse->json('data.id');

        // Verify workspace was created
        $this->assertDatabaseHas('workspaces', [
            'id' => $workspaceId,
            'name' => 'My Workspace',
        ]);

        // Step 3: Create regions (prerequisite data)
        $region1 = Region::factory()->create(['name' => 'Miami']);
        $region2 = Region::factory()->create(['name' => 'Orlando']);

        // Step 4: Create tags (prerequisite data)
        $tag1 = Tag::factory()->create(['name' => 'News']);
        $tag2 = Tag::factory()->create(['name' => 'Events']);

        // Step 5: Create first post (draft)
        $postResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/posts', [
                'workspace_id' => $workspaceId,
                'title' => 'My First Post',
                'content' => 'This is my first post content',
                'status' => 'draft',
                'region_ids' => [$region1->id, $region2->id],
                'tag_ids' => [$tag1->id, $tag2->id],
            ]);

        $postResponse->assertStatus(201);
        $postId = $postResponse->json('data.id');

        // Step 6: Verify post is draft (not publicly visible)
        $publicPostsResponse = $this->getJson('/api/v1/posts');
        $publicPostsResponse->assertStatus(200);
        $publicPostIds = collect($publicPostsResponse->json('data'))->pluck('id')->toArray();
        $this->assertNotContains($postId, $publicPostIds, 'Draft post should not be publicly visible');

        // Step 7: Publish post
        $publishResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/v1/posts/{$postId}/publish");

        $publishResponse->assertStatus(200);

        // Step 8: Verify post is now publicly visible
        $publicPostsResponse = $this->getJson('/api/v1/posts');
        $publicPostsResponse->assertStatus(200);
        $publicPostIds = collect($publicPostsResponse->json('data'))->pluck('id')->toArray();
        $this->assertContains($postId, $publicPostIds, 'Published post should be publicly visible');

        // Step 9: Verify relationships
        $postDetailsResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/v1/posts/{$postId}");

        $postDetailsResponse->assertStatus(200);
        $postData = $postDetailsResponse->json('data');
        
        $this->assertCount(2, $postData['regions'], 'Post should have 2 regions');
        $this->assertCount(2, $postData['tags'], 'Post should have 2 tags');
        $this->assertEquals('published', $postData['status'], 'Post status should be published');

        // Step 10: Add comment as different user
        $commenter = User::factory()->create();
        $commenterToken = $commenter->createToken('test')->plainTextToken;

        $commentResponse = $this->withHeader('Authorization', "Bearer {$commenterToken}")
            ->postJson("/api/v1/posts/{$postId}/comments", [
                'content' => 'Great post!',
            ]);

        $commentResponse->assertStatus(201);

        // Step 11: Verify comment appears
        $commentsResponse = $this->getJson("/api/v1/posts/{$postId}/comments");
        $commentsResponse->assertStatus(200);
        $comments = $commentsResponse->json('data');
        $this->assertCount(1, $comments, 'Post should have 1 comment');
        $this->assertEquals('Great post!', $comments[0]['content']);
    }
}


