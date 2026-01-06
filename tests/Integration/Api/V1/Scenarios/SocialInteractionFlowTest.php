<?php

declare(strict_types=1);

namespace Tests\Integration\Api\V1\Scenarios;

use App\Models\Community;
use App\Models\SocialGroup;
use App\Models\User;
use Tests\Integration\Api\V1\IntegrationTestCase;

/**
 * Integration Test: Complete Social Interaction Flow
 * 
 * This test simulates a complete social interaction scenario:
 * 1. User creates social post
 * 2. Another user likes post
 * 3. Another user comments
 * 4. User creates community
 * 5. User creates thread in community
 * 6. Users reply to thread
 * 7. User sends direct message
 * 8. User follows another user
 * 9. User joins group
 * 10. User creates group post
 */
final class SocialInteractionFlowTest extends IntegrationTestCase
{
    public function test_complete_social_interaction_workflow(): void
    {
        // Step 1: User creates social post
        $postResponse = $this->authenticatedJson('POST', '/api/v1/social/posts', [
            'content' => 'This is my first social post!',
            'visibility' => 'public',
        ]);

        $postResponse->assertStatus(201);
        $postId = $postResponse->json('data.id');

        // Step 2: Another user likes post
        $otherUser = User::factory()->create();
        $otherUserToken = $otherUser->createToken('test')->plainTextToken;

        $likeResponse = $this->withHeader('Authorization', "Bearer {$otherUserToken}")
            ->postJson("/api/v1/social/posts/{$postId}/like");

        $likeResponse->assertStatus(200);

        // Step 3: Another user comments
        $commentResponse = $this->withHeader('Authorization', "Bearer {$otherUserToken}")
            ->postJson("/api/v1/social/posts/{$postId}/comments", [
                'content' => 'Great post!',
            ]);

        $commentResponse->assertStatus(201);

        // Step 4: User creates community
        $communityResponse = $this->authenticatedJson('POST', '/api/v1/communities', [
            'name' => 'Test Community',
            'description' => 'A test community',
            'is_public' => true,
        ]);

        $communityResponse->assertStatus(201);
        $communityId = $communityResponse->json('data.id');

        // Step 5: User creates thread in community
        $threadResponse = $this->authenticatedJson('POST', "/api/v1/communities/{$communityId}/threads", [
            'title' => 'Test Thread',
            'content' => 'This is a test thread',
        ]);

        $threadResponse->assertStatus(201);
        $threadId = $threadResponse->json('data.id');

        // Step 6: Users reply to thread
        $replyResponse = $this->withHeader('Authorization', "Bearer {$otherUserToken}")
            ->postJson("/api/v1/communities/{$communityId}/threads/{$threadId}/replies", [
                'content' => 'This is a reply',
            ]);

        $replyResponse->assertStatus(201);

        // Step 7: User sends direct message
        $conversationResponse = $this->authenticatedJson('POST', '/api/v1/conversations', [
            'participant_id' => $otherUser->id,
        ]);

        $conversationResponse->assertStatus(201);
        $conversationId = $conversationResponse->json('data.id');

        $messageResponse = $this->authenticatedJson('POST', "/api/v1/conversations/{$conversationId}/messages", [
            'content' => 'Hello!',
        ]);

        $messageResponse->assertStatus(201);

        // Step 8: User follows another user
        $followResponse = $this->authenticatedJson('POST', "/api/v1/users/{$otherUser->id}/follow");
        $followResponse->assertStatus(201);

        // Step 9: User creates group
        $groupResponse = $this->authenticatedJson('POST', '/api/v1/social/groups', [
            'name' => 'Test Group',
            'description' => 'A test group',
            'is_public' => true,
        ]);

        $groupResponse->assertStatus(201);
        $groupId = $groupResponse->json('data.id');

        // Step 10: User creates group post
        $groupPostResponse = $this->authenticatedJson('POST', "/api/v1/social/groups/{$groupId}/posts", [
            'content' => 'Group post content',
        ]);

        $groupPostResponse->assertStatus(201);

        // Verify all interactions
        $postDetailsResponse = $this->authenticatedJson('GET', "/api/v1/social/posts/{$postId}");
        $postDetailsResponse->assertStatus(200);
        $postData = $postDetailsResponse->json('data');
        $this->assertGreaterThan(0, $postData['likes_count']);
        $this->assertGreaterThan(0, $postData['comments_count']);
    }
}


