# Complete API Documentation & Integration Testing Guide

**Date:** December 29, 2025  
**Status:** Ready for Implementation

## Overview

This guide covers:
1. **Scribe Documentation Setup** - Generate API docs from code
2. **Markdown Export** - Export docs to MD files
3. **Integration Test Suite** - Test complete API scenarios

---

## Part 1: Scribe API Documentation

### Installation ✅
```bash
composer require --dev knuckleswtf/scribe
php artisan vendor:publish --tag=scribe-config
```

### Configuration

**File:** `config/scribe.php`

Key settings:
- `type`: `'static'` (generates HTML + MD files)
- `base_url`: Your API base URL
- `routes`: `['prefixes' => ['api/*']]` (documents all API routes)
- `output_path`: `'public/docs'` (where HTML docs go)
- Markdown files are generated in `resources/docs/source/`

### Generate Documentation

```bash
# Generate all documentation
php artisan scribe:generate

# Outputs:
# - public/docs/index.html (HTML documentation)
# - resources/docs/source/*.md (Markdown source files)
# - public/docs/postman.json (Postman collection)
# - public/docs/openapi.yaml (OpenAPI spec)
```

### Adding Documentation to Controllers

#### Basic Example
```php
/**
 * @group Authentication
 * 
 * Register a new user account.
 */
public function register(RegisterRequest $request): JsonResponse
{
    // ...
}
```

#### Advanced Example with Parameters
```php
/**
 * @group Posts
 * 
 * Create a new post.
 * 
 * @bodyParam workspace_id string required The workspace ID. Example: 550e8400-e29b-41d4-a716-446655440000
 * @bodyParam title string required The post title. Example: My First Post
 * @bodyParam content string required The post content.
 * @bodyParam status string The post status. Example: draft
 * 
 * @response 201 {
 *   "success": true,
 *   "message": "Post created successfully",
 *   "data": {
 *     "id": "550e8400-e29b-41d4-a716-446655440000",
 *     "title": "My First Post"
 *   }
 * }
 * 
 * @response 422 {
 *   "success": false,
 *   "message": "Validation Failed",
 *   "errors": {
 *     "title": ["The title field is required."]
 *   }
 * }
 */
public function store(StorePostRequest $request): JsonResponse
{
    // ...
}
```

### Export to Markdown Files

Create custom command:

```bash
php artisan make:command ExportApiDocsToMarkdown
```

Then run:
```bash
php artisan api:export-markdown
```

This will:
1. Generate Scribe docs
2. Copy markdown files to `docs/api/`
3. Organize by version/category

---

## Part 2: Integration Test Suite

### What Are Integration Tests?

Integration tests differ from unit/feature tests:
- ✅ Test **complete workflows** across multiple endpoints
- ✅ Test **real-world scenarios** users perform
- ✅ Test **data flow** through entire system
- ✅ Test **relationships** between endpoints
- ✅ Test **state changes** affecting multiple resources

### Test Structure

```
tests/Integration/Api/V1/
├── IntegrationTestCase.php (Base class)
├── Scenarios/
│   ├── UserRegistrationWorkflowTest.php
│   ├── CRMCustomerJourneyTest.php
│   ├── EventTicketingWorkflowTest.php
│   ├── EcommercePurchaseFlowTest.php
│   └── SocialInteractionFlowTest.php
└── Workflows/
    ├── PublishingWorkflowTest.php
    └── CRMWorkflowTest.php
```

### Base Test Class

**File:** `tests/Integration/Api/V1/IntegrationTestCase.php`

Provides:
- Authenticated user setup
- Helper methods for API calls
- Assertion helpers
- Common test utilities

### Example: User Registration Workflow

**File:** `tests/Integration/Api/V1/Scenarios/UserRegistrationWorkflowTest.php`

**Scenario:** New user registers → Creates workspace → Publishes first post → Receives comments

**Steps:**
1. Register user → Get token
2. Create workspace
3. Create regions & tags
4. Create post (draft)
5. Verify draft not publicly visible
6. Publish post
7. Verify post publicly visible
8. Verify relationships (regions, tags)
9. Add comment as different user
10. Verify comment appears

### Example: CRM Customer Journey

**File:** `tests/Integration/Api/V1/Scenarios/CRMCustomerJourneyTest.php`

**Scenario:** Complete customer lifecycle from lead to customer

**Steps:**
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

### Running Integration Tests

```bash
# Run all integration tests
php artisan test --testsuite=Integration

# Run specific scenario
php artisan test tests/Integration/Api/V1/Scenarios/UserRegistrationWorkflowTest.php

# Run with coverage
php artisan test --coverage --testsuite=Integration
```

### Test Scenarios to Implement

1. ✅ **User Registration Workflow** - Register → Workspace → First Post
2. ✅ **CRM Customer Journey** - Business → Customer → Deal → Task → Won
3. ⏳ **Event Ticketing Flow** - Event → Venue → Ticket Plans → Order → Payment
4. ⏳ **E-commerce Purchase** - Store → Products → Cart → Order → Payment
5. ⏳ **Social Interaction** - Post → Like → Comment → Follow → Group
6. ⏳ **Content Publishing** - Draft → Review → Publish → Engagement
7. ⏳ **Multi-User Collaboration** - Workspace → Members → Permissions → Content

---

## Part 3: Complete Workflow

### Step 1: Generate API Documentation

```bash
# Add DocBlocks to controllers (see examples above)
# Then generate:
php artisan scribe:generate

# Export to markdown:
php artisan api:export-markdown
```

### Step 2: Create Integration Tests

```bash
# Use base class
php artisan make:test Integration/Api/V1/Scenarios/YourScenarioTest

# Extend IntegrationTestCase
# Implement complete workflow
# Test all relationships
```

### Step 3: Run Tests

```bash
# Run integration tests
php artisan test --testsuite=Integration

# Fix any failures
# Verify all scenarios pass
```

### Step 4: Review Documentation

```bash
# View HTML docs
open public/docs/index.html

# Review markdown files
cat docs/api/index.md
```

---

## Documentation Output Structure

```
docs/
├── api/
│   ├── index.md (Main documentation)
│   ├── authentication.md
│   ├── users.md
│   ├── posts.md
│   ├── crm.md
│   └── ...
├── integration-tests/
│   ├── scenarios.md (Test scenarios documentation)
│   └── README.md
└── README.md
```

---

## Best Practices

### Documentation
1. ✅ Add DocBlocks to ALL controllers
2. ✅ Include realistic examples
3. ✅ Document error responses
4. ✅ Group related endpoints
5. ✅ Keep docs updated

### Integration Tests
1. ✅ Test complete workflows
2. ✅ Verify state changes
3. ✅ Test relationships
4. ✅ Use realistic data
5. ✅ Test error cases
6. ✅ Keep tests independent

---

## Next Steps

1. **Add DocBlocks** to all 64 controllers
2. **Generate documentation** with Scribe
3. **Export to Markdown** files
4. **Create integration tests** for all scenarios
5. **Run tests** and fix any issues
6. **Review documentation** for accuracy
7. **Set up CI/CD** to auto-generate docs

---

## Estimated Timeline

- **Documentation Setup:** 2 hours
- **Add DocBlocks:** 8 hours (64 controllers)
- **Generate & Export:** 1 hour
- **Integration Tests:** 34 hours (80-110 scenarios)
- **Review & Refine:** 4 hours

**Total:** ~49 hours

---

## Success Criteria

✅ All endpoints documented  
✅ Markdown files generated  
✅ Integration tests cover all workflows  
✅ All tests pass  
✅ Documentation is accurate and up-to-date  


