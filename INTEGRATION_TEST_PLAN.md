# API Integration Test Suite Plan

**Date:** December 29, 2025  
**Purpose:** Create comprehensive integration tests that test real-world API scenarios

## Overview

Integration tests differ from unit/feature tests in that they:
- Test **complete workflows** across multiple endpoints
- Test **real-world scenarios** that users would perform
- Test **data flow** through the entire system
- Test **relationships** between different API endpoints
- Test **state changes** that affect multiple resources

## Test Structure

### Directory Structure
```
tests/Integration/Api/V1/
├── Scenarios/
│   ├── UserRegistrationWorkflowTest.php
│   ├── ContentPublishingWorkflowTest.php
│   ├── CRMCustomerJourneyTest.php
│   ├── EventTicketingWorkflowTest.php
│   ├── EcommercePurchaseFlowTest.php
│   └── SocialInteractionFlowTest.php
├── Workflows/
│   ├── PublishingWorkflowTest.php
│   ├── CRMWorkflowTest.php
│   ├── TicketingWorkflowTest.php
│   └── EcommerceWorkflowTest.php
└── EndToEnd/
    ├── CompleteUserJourneyTest.php
    └── MultiTenantScenarioTest.php
```

## Test Scenarios

### 1. User Registration & Onboarding Workflow
**Scenario:** New user registers, creates workspace, publishes first post

**Steps:**
1. Register new user → Get token
2. Create workspace
3. Add regions to workspace
4. Create first post
5. Publish post
6. Verify post is visible publicly
7. Add tags to post
8. Add comments to post

**Expected:** Complete workflow succeeds, data persists correctly

### 2. Content Publishing Workflow
**Scenario:** Author creates and publishes content with all relationships

**Steps:**
1. Authenticate as author
2. Create post (draft)
3. Add regions
4. Add tags
5. Upload featured image
6. Publish post
7. Verify post appears in feeds
8. Add comment as different user
9. Like comment
10. Report comment

**Expected:** All relationships work, content is discoverable

### 3. CRM Customer Journey
**Scenario:** Complete customer lifecycle from lead to customer

**Steps:**
1. Create SMB Business
2. Create Customer (lead stage)
3. Add interaction (phone call)
4. Create deal
5. Update deal stage
6. Add task
7. Complete task
8. Create campaign
9. Add customer to campaign
10. Send campaign
11. Update customer lifecycle stage
12. Convert deal to won

**Expected:** Customer progresses through lifecycle, all relationships maintained

### 4. Event Ticketing Workflow
**Scenario:** Create event, sell tickets, process orders

**Steps:**
1. Create event
2. Create venue
3. Link event to venue
4. Create ticket plans (VIP, General)
5. Create promo code
6. User registers
7. User browses events
8. User selects event
9. User adds tickets to cart
10. User applies promo code
11. User completes purchase
12. Verify ticket order
13. Verify ticket availability updated

**Expected:** Complete ticketing flow works, inventory updates correctly

### 5. E-commerce Purchase Flow
**Scenario:** User browses, adds to cart, purchases products

**Steps:**
1. Create store
2. Create products
3. User browses products
4. User adds products to cart
5. User updates quantities
6. User removes items
7. User creates order
8. Process payment (mock)
9. Verify order status
10. Verify inventory updated

**Expected:** Complete purchase flow, inventory management works

### 6. Social Interaction Flow
**Scenario:** User creates social content, interacts with community

**Steps:**
1. User creates social post
2. Another user likes post
3. Another user comments
4. User creates community
5. User creates thread in community
6. Users reply to thread
7. User sends direct message
8. User follows another user
9. User joins group
10. User creates group post

**Expected:** All social interactions work, notifications triggered

## Implementation Approach

### Base Integration Test Class

```php
<?php

namespace Tests\Integration\Api\V1;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

abstract class IntegrationTestCase extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected string $token;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create authenticated user for all tests
        $this->user = User::factory()->create();
        $this->token = $this->user->createToken('integration-test')->plainTextToken;
    }

    protected function authenticatedJson(string $method, string $uri, array $data = []): \Illuminate\Testing\TestResponse
    {
        return $this->withHeader('Authorization', "Bearer {$this->token}")
            ->json($method, $uri, $data);
    }

    protected function assertApiSuccess(\Illuminate\Testing\TestResponse $response): void
    {
        $response->assertStatus(200)
            ->assertJsonStructure(['success', 'data']);
    }

    protected function assertApiCreated(\Illuminate\Testing\TestResponse $response): void
    {
        $response->assertStatus(201)
            ->assertJsonStructure(['success', 'message', 'data']);
    }
}
```

### Example: User Registration Workflow Test

```php
<?php

namespace Tests\Integration\Api\V1\Scenarios;

use App\Models\Region;
use App\Models\Tag;
use App\Models\Workspace;
use Tests\Integration\Api\V1\IntegrationTestCase;

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

        $registerResponse->assertStatus(201);
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

        // Step 3: Create regions
        $region1 = Region::factory()->create(['name' => 'Miami']);
        $region2 = Region::factory()->create(['name' => 'Orlando']);

        // Step 4: Create tags
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
        $this->assertNotContains($postId, $publicPostsResponse->json('data.*.id'));

        // Step 7: Publish post
        $publishResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/v1/posts/{$postId}/publish");

        $publishResponse->assertStatus(200);

        // Step 8: Verify post is now publicly visible
        $publicPostsResponse = $this->getJson('/api/v1/posts');
        $publicPostsResponse->assertStatus(200);
        $this->assertContains($postId, $publicPostsResponse->json('data.*.id'));

        // Step 9: Verify relationships
        $postDetailsResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/v1/posts/{$postId}");

        $postDetailsResponse->assertStatus(200);
        $postData = $postDetailsResponse->json('data');
        
        $this->assertCount(2, $postData['regions']);
        $this->assertCount(2, $postData['tags']);
        $this->assertEquals('published', $postData['status']);

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
        $this->assertCount(1, $commentsResponse->json('data'));
    }
}
```

## Test Categories

### 1. Workflow Tests
Test complete business processes:
- User onboarding
- Content creation and publishing
- Customer relationship management
- Order processing
- Event management

### 2. State Transition Tests
Test how resources change state:
- Draft → Published
- Lead → Customer
- Pending → Completed
- Active → Inactive

### 3. Relationship Tests
Test how resources relate:
- Post → Regions → Tags → Comments
- Customer → Deals → Tasks → Campaigns
- Event → Venue → Ticket Plans → Orders

### 4. Data Integrity Tests
Test data consistency:
- Inventory updates correctly
- Totals calculate correctly
- Relationships maintain integrity
- Cascading deletes work

### 5. Multi-User Scenarios
Test concurrent operations:
- Multiple users accessing same resource
- Race conditions
- Permission boundaries
- Data isolation

## Best Practices

1. **Use Real Data:** Create realistic test data using factories
2. **Test State Changes:** Verify before/after states
3. **Test Relationships:** Ensure relationships persist correctly
4. **Test Edge Cases:** Empty results, pagination boundaries
5. **Test Error Handling:** Invalid inputs, unauthorized access
6. **Clean Up:** Use RefreshDatabase to ensure clean state
7. **Document Scenarios:** Each test should tell a story
8. **Independent Tests:** Each test should be able to run alone

## Running Integration Tests

```bash
# Run all integration tests
php artisan test --testsuite=Integration

# Run specific scenario
php artisan test tests/Integration/Api/V1/Scenarios/UserRegistrationWorkflowTest.php

# Run with coverage
php artisan test --coverage --testsuite=Integration
```

## Success Criteria

- ✅ All workflows complete successfully
- ✅ Data persists correctly across requests
- ✅ Relationships maintain integrity
- ✅ State transitions work as expected
- ✅ Multi-user scenarios work correctly
- ✅ Error handling is appropriate
- ✅ Performance is acceptable

## Estimated Test Count

- **Workflow Tests:** 20-30 scenarios
- **State Transition Tests:** 15-20 scenarios
- **Relationship Tests:** 20-25 scenarios
- **Data Integrity Tests:** 15-20 scenarios
- **Multi-User Scenarios:** 10-15 scenarios

**Total:** ~80-110 integration test scenarios

## Timeline

- **Setup & Base Classes:** 2 hours
- **Workflow Tests:** 8 hours
- **State Transition Tests:** 6 hours
- **Relationship Tests:** 8 hours
- **Data Integrity Tests:** 6 hours
- **Multi-User Scenarios:** 4 hours

**Total:** ~34 hours


