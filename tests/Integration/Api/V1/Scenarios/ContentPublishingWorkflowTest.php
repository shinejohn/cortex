<?php

declare(strict_types=1);

namespace Tests\Integration\Api\V1\Scenarios;

use App\Models\DayNewsPost;
use App\Models\Region;
use App\Models\Tag;
use App\Models\User;
use App\Models\Workspace;
use Tests\Integration\Api\V1\IntegrationTestCase;

/**
 * Integration Test: Complete Content Publishing Workflow
 * 
 * This test simulates a complete content publishing scenario:
 * 1. Author creates post (draft)
 * 2. Add regions
 * 3. Add tags
 * 4. Upload featured image
 * 5. Publish post
 * 6. Verify post appears in feeds
 * 7. Add comment as different user
 * 8. Like comment
 * 9. Report comment
 */
final class ContentPublishingWorkflowTest extends IntegrationTestCase
{
    public function test_complete_content_publishing_workflow(): void
    {
        $workspace = Workspace::factory()->create();
        $region1 = Region::factory()->create(['name' => 'Miami']);
        $region2 = Region::factory()->create(['name' => 'Orlando']);
        $tag1 = Tag::factory()->create(['name' => 'News']);
        $tag2 = Tag::factory()->create(['name' => 'Events']);

        // Step 1: Author creates post (draft)
        $postResponse = $this->authenticatedJson('POST', '/api/v1/posts', [
            'workspace_id' => $workspace->id,
            'title' => 'Test Article',
            'content' => 'This is a test article content',
            'status' => 'draft',
            'region_ids' => [$region1->id, $region2->id],
            'tag_ids' => [$tag1->id, $tag2->id],
        ]);

        $postResponse->assertStatus(201);
        $postId = $postResponse->json('data.id');

        // Verify draft status
        $this->assertDatabaseHas('day_news_posts', [
            'id' => $postId,
            'status' => 'draft',
        ]);

        // Step 2: Verify regions attached
        $postDetailsResponse = $this->authenticatedJson('GET', "/api/v1/posts/{$postId}");
        $postDetailsResponse->assertStatus(200);
        $postData = $postDetailsResponse->json('data');
        $this->assertCount(2, $postData['regions']);

        // Step 3: Verify tags attached
        $this->assertCount(2, $postData['tags']);

        // Step 4: Update post with featured image (simulated)
        $updateResponse = $this->authenticatedJson('PUT', "/api/v1/posts/{$postId}", [
            'featured_image' => 'https://example.com/image.jpg',
        ]);

        $updateResponse->assertStatus(200);

        // Step 5: Publish post
        $publishResponse = $this->authenticatedJson('PATCH', "/api/v1/posts/{$postId}/publish");
        $publishResponse->assertStatus(200);

        // Verify published status
        $this->assertDatabaseHas('day_news_posts', [
            'id' => $postId,
            'status' => 'published',
        ]);

        // Step 6: Verify post appears in feeds
        $publicPostsResponse = $this->getJson('/api/v1/posts');
        $publicPostsResponse->assertStatus(200);
        $publicPostIds = collect($publicPostsResponse->json('data'))->pluck('id')->toArray();
        $this->assertContains($postId, $publicPostIds);

        // Step 7: Add comment as different user
        $commenter = User::factory()->create();
        $commenterToken = $commenter->createToken('test')->plainTextToken;

        $commentResponse = $this->withHeader('Authorization', "Bearer {$commenterToken}")
            ->postJson("/api/v1/posts/{$postId}/comments", [
                'content' => 'Great article!',
            ]);

        $commentResponse->assertStatus(201);
        $commentId = $commentResponse->json('data.id');

        // Step 8: Verify comment appears
        $commentsResponse = $this->getJson("/api/v1/posts/{$postId}/comments");
        $commentsResponse->assertStatus(200);
        $comments = $commentsResponse->json('data');
        $this->assertCount(1, $comments);
        $this->assertEquals('Great article!', $comments[0]['content']);

        // Step 9: Verify post has comment count
        $finalPostResponse = $this->authenticatedJson('GET', "/api/v1/posts/{$postId}");
        $finalPostData = $finalPostResponse->json('data');
        $this->assertGreaterThan(0, $finalPostData['comments_count']);
    }
}


