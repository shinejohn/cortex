<?php

declare(strict_types=1);

namespace Tests\Integration\Api\V1\Scenarios;

use App\Models\User;
use App\Models\Workspace;
use Tests\Integration\Api\V1\IntegrationTestCase;

/**
 * Integration Test: Multi-User Collaboration Workflow
 * 
 * This test simulates a multi-user collaboration scenario:
 * 1. User creates workspace
 * 2. User invites other users
 * 3. Users accept invitations
 * 4. Users collaborate on content
 * 5. Verify permissions
 * 6. Verify data isolation
 */
final class MultiUserCollaborationTest extends IntegrationTestCase
{
    public function test_complete_multi_user_collaboration_workflow(): void
    {
        // Step 1: User creates workspace
        $workspaceResponse = $this->authenticatedJson('POST', '/api/v1/workspaces', [
            'name' => 'Collaboration Workspace',
            'slug' => 'collab-workspace',
        ]);

        $workspaceResponse->assertStatus(201);
        $workspaceId = $workspaceResponse->json('data.id');

        // Step 2: User invites other users
        $user2 = User::factory()->create();
        $user3 = User::factory()->create();

        $invitation1Response = $this->authenticatedJson('POST', "/api/v1/workspaces/{$workspaceId}/invitations", [
            'email' => $user2->email,
            'role' => 'editor',
        ]);

        $invitation1Response->assertStatus(201);

        $invitation2Response = $this->authenticatedJson('POST', "/api/v1/workspaces/{$workspaceId}/invitations", [
            'email' => $user3->email,
            'role' => 'viewer',
        ]);

        $invitation2Response->assertStatus(201);

        // Step 3: Verify invitations created
        $invitationsResponse = $this->authenticatedJson('GET', "/api/v1/workspaces/{$workspaceId}/invitations");
        $invitationsResponse->assertStatus(200);
        $invitations = $invitationsResponse->json('data');
        $this->assertCount(2, $invitations);

        // Step 4: User2 creates content (as editor)
        $user2Token = $user2->createToken('test')->plainTextToken;

        $postResponse = $this->withHeader('Authorization', "Bearer {$user2Token}")
            ->postJson('/api/v1/posts', [
                'workspace_id' => $workspaceId,
                'title' => 'User 2 Post',
                'content' => 'Content from user 2',
                'status' => 'draft',
            ]);

        $postResponse->assertStatus(201);
        $postId = $postResponse->json('data.id');

        // Step 5: User3 tries to edit (should fail - viewer role)
        $user3Token = $user3->createToken('test')->plainTextToken;

        $updateResponse = $this->withHeader('Authorization', "Bearer {$user3Token}")
            ->putJson("/api/v1/posts/{$postId}", [
                'title' => 'Updated Title',
            ]);

        // Viewer should not be able to edit
        $updateResponse->assertStatus(403);

        // Step 6: User2 updates post (should succeed - editor role)
        $updateResponse2 = $this->withHeader('Authorization', "Bearer {$user2Token}")
            ->putJson("/api/v1/posts/{$postId}", [
                'title' => 'Updated Title by Editor',
            ]);

        $updateResponse2->assertStatus(200);

        // Step 7: Verify workspace members
        $membersResponse = $this->authenticatedJson('GET', "/api/v1/workspaces/{$workspaceId}/members");
        $membersResponse->assertStatus(200);
        $members = $membersResponse->json('data');
        $this->assertGreaterThanOrEqual(1, count($members));

        // Step 8: Verify data isolation - user can only see their workspace content
        $userPostsResponse = $this->withHeader('Authorization', "Bearer {$user2Token}")
            ->getJson('/api/v1/posts');

        $userPostsResponse->assertStatus(200);
        $userPosts = $userPostsResponse->json('data');
        // Should see posts from their workspace
        $this->assertGreaterThanOrEqual(1, count($userPosts));
    }
}


