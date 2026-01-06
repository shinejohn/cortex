# Integration Testing Complete Guide

**Date:** December 29, 2025  
**Purpose:** Comprehensive guide for creating and running integration tests for API scenarios

## What Are Integration Tests?

Integration tests verify that multiple API endpoints work together correctly to complete real-world workflows. Unlike unit tests that test individual components, integration tests:

- ✅ Test **complete workflows** across multiple endpoints
- ✅ Test **real-world scenarios** that users actually perform
- ✅ Test **data flow** through the entire system
- ✅ Test **relationships** between different resources
- ✅ Test **state changes** that affect multiple resources
- ✅ Test **business logic** end-to-end

## Why Integration Tests?

1. **Catch Integration Bugs**: Find issues when endpoints interact
2. **Verify Workflows**: Ensure complete user journeys work
3. **Test Relationships**: Verify data relationships persist correctly
4. **Document Usage**: Tests serve as usage examples
5. **Prevent Regressions**: Catch breaking changes early

## Test Structure

```
tests/Integration/Api/V1/
├── IntegrationTestCase.php          # Base class with helpers
├── Scenarios/                        # Real-world user scenarios
│   ├── UserRegistrationWorkflowTest.php
│   ├── CRMCustomerJourneyTest.php
│   ├── EventTicketingWorkflowTest.php
│   ├── EcommercePurchaseFlowTest.php
│   └── SocialInteractionFlowTest.php
└── Workflows/                        # Business process workflows
    ├── PublishingWorkflowTest.php
    ├── CRMWorkflowTest.php
    └── TicketingWorkflowTest.php
```

## Base Test Class

**File:** `tests/Integration/Api/V1/IntegrationTestCase.php`

Provides:
- Authenticated user setup
- Helper methods for API calls
- Assertion helpers
- Common utilities

**Key Methods:**
- `authenticatedJson()` - Make authenticated API calls
- `assertApiSuccess()` - Assert successful response
- `assertApiCreated()` - Assert resource creation
- `assertApiError()` - Assert error response
- `getResponseData()` - Extract data from response

## Test Scenarios

### 1. User Registration & Onboarding ✅

**File:** `tests/Integration/Api/V1/Scenarios/UserRegistrationWorkflowTest.php`

**Workflow:**
1. Register new user → Get token
2. Create workspace
3. Create regions & tags
4. Create first post (draft)
5. Verify draft not publicly visible
6. Publish post
7. Verify post publicly visible
8. Verify relationships (regions, tags)
9. Add comment as different user
10. Verify comment appears

**What It Tests:**
- User registration flow
- Workspace creation
- Post creation and publishing
- Relationship management
- Multi-user interactions

### 2. CRM Customer Journey ✅

**File:** `tests/Integration/Api/V1/Scenarios/CRMCustomerJourneyTest.php`

**Workflow:**
1. Create SMB Business
2. Create Customer (lead stage)
3. Add interaction (phone call)
4. Create deal
5. Update deal stages (prospecting → qualification → won)
6. Create task
7. Complete task
8. Convert deal to won
9. Update customer lifecycle stage (lead → customer)
10. Verify all relationships

**What It Tests:**
- Complete CRM workflow
- State transitions
- Relationship integrity
- Business logic

### 3. Event Ticketing Flow ⏳

**Workflow:**
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

**What It Tests:**
- Event management
- Ticket inventory
- Promo code application
- Order processing
- Inventory updates

### 4. E-commerce Purchase Flow ⏳

**Workflow:**
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

**What It Tests:**
- Product catalog
- Shopping cart
- Order processing
- Inventory management
- Payment flow

### 5. Social Interaction Flow ⏳

**Workflow:**
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

**What It Tests:**
- Social features
- User interactions
- Community features
- Messaging
- Notifications

## Writing Integration Tests

### Step 1: Extend Base Class

```php
<?php

namespace Tests\Integration\Api\V1\Scenarios;

use Tests\Integration\Api\V1\IntegrationTestCase;

final class YourScenarioTest extends IntegrationTestCase
{
    // Tests go here
}
```

### Step 2: Write Test Method

```php
public function test_complete_workflow(): void
{
    // Step 1: Setup
    // Step 2: Execute workflow
    // Step 3: Verify results
    // Step 4: Verify relationships
    // Step 5: Verify state changes
}
```

### Step 3: Use Helper Methods

```php
// Make authenticated request
$response = $this->authenticatedJson('POST', '/api/v1/posts', [
    'title' => 'Test Post',
    'content' => 'Content',
]);

// Assert success
$this->assertApiSuccess($response);

// Get response data
$data = $this->getResponseData($response);
```

### Step 4: Verify State Changes

```php
// Before action
$this->assertDatabaseHas('posts', ['status' => 'draft']);

// Perform action
$response = $this->authenticatedJson('PATCH', "/api/v1/posts/{$postId}/publish");

// After action
$this->assertDatabaseHas('posts', ['status' => 'published']);
```

### Step 5: Verify Relationships

```php
// Get resource with relationships
$response = $this->authenticatedJson('GET', "/api/v1/posts/{$postId}");
$post = $this->getResponseData($response);

// Verify relationships
$this->assertCount(2, $post['regions']);
$this->assertCount(3, $post['tags']);
$this->assertCount(5, $post['comments']);
```

## Best Practices

### 1. Test Complete Workflows
Don't test individual endpoints in isolation. Test the complete user journey.

### 2. Use Realistic Data
Use factories to create realistic test data that matches production scenarios.

### 3. Verify State Changes
Always verify before/after states to ensure actions have the expected effect.

### 4. Test Relationships
Verify that relationships are created, maintained, and accessible correctly.

### 5. Test Error Cases
Include tests for error scenarios (validation failures, unauthorized access, etc.).

### 6. Keep Tests Independent
Each test should be able to run independently without relying on other tests.

### 7. Clean Up
Use `RefreshDatabase` trait to ensure clean state between tests.

### 8. Document Scenarios
Add comments explaining what each test scenario represents.

## Running Tests

```bash
# Run all integration tests
php artisan test --testsuite=Integration

# Run specific test file
php artisan test tests/Integration/Api/V1/Scenarios/UserRegistrationWorkflowTest.php

# Run specific test method
php artisan test --filter=test_complete_user_registration

# Run with coverage
php artisan test --coverage --testsuite=Integration

# Run in parallel (faster)
php artisan test --parallel --testsuite=Integration
```

## Test Coverage Goals

- ✅ **Workflow Tests:** 20-30 scenarios
- ✅ **State Transition Tests:** 15-20 scenarios
- ✅ **Relationship Tests:** 20-25 scenarios
- ✅ **Data Integrity Tests:** 15-20 scenarios
- ✅ **Multi-User Scenarios:** 10-15 scenarios

**Total:** ~80-110 integration test scenarios

## CI/CD Integration

Add to `.github/workflows/tests.yml`:

```yaml
integration-tests:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v2
    - name: Setup PHP
      uses: shivammathur/setup-php@v2
      with:
        php-version: '8.4'
    - name: Install Dependencies
      run: composer install
    - name: Run Integration Tests
      run: php artisan test --testsuite=Integration
```

## Troubleshooting

### Tests Failing Due to Database
- Ensure PostgreSQL is running
- Check `.env.testing` configuration
- Run migrations: `php artisan migrate --env=testing`

### Authentication Issues
- Verify Sanctum is configured
- Check token generation
- Verify middleware is applied

### Relationship Issues
- Verify factories create relationships
- Check model relationships are defined
- Verify foreign keys exist

## Next Steps

1. ✅ Create base test class
2. ✅ Create example scenarios
3. ⏳ Create remaining scenarios
4. ⏳ Add to CI/CD pipeline
5. ⏳ Document all scenarios
6. ⏳ Run regularly

## Summary

Integration tests are essential for:
- ✅ Verifying complete workflows
- ✅ Catching integration bugs
- ✅ Documenting API usage
- ✅ Preventing regressions

Start with the base class and example scenarios, then expand to cover all workflows in your API.


