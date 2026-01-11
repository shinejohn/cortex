# Testing Standards

## Overview

This document defines testing standards and practices for the Laravel + Vue + AWS + Postgres stack.

---

## Test Categories

### Critical Tests (`@group critical`)

**Purpose:** Tests that MUST pass before deployment.

**Includes:**
- User authentication (login, logout, password reset)
- Authorization (permissions, roles, policies)
- Payment processing (Stripe, ticket purchases)
- Data creation/modification for core entities
- API authentication
- Security middleware

**Requirements:**
- Must run in < 2 minutes total
- Block deployment if failing
- Run in CI/CD before build step

**Example:**
```php
/**
 * @group critical
 */
test('user can login', function () {
    // Test implementation
});
```

---

### Standard Tests (default)

**Purpose:** Tests that should pass, investigated if failing.

**Includes:**
- Feature tests for non-critical features
- Unit tests for business logic
- Integration tests

**Requirements:**
- Should pass but don't block deployment
- Failures are reported and investigated
- Full feature coverage

---

### Quarantine Tests (`@group quarantine`)

**Purpose:** Known flaky or broken tests.

**Includes:**
- Tests with race conditions
- Tests dependent on external APIs without mocks
- Tests that pass sometimes, fail others
- Tests for deprecated features

**Requirements:**
- Non-blocking for deployment
- Run separately in CI/CD
- Each test must have a GitHub issue tracking its fix
- Reviewed weekly

**Location:** `tests/Quarantine/`

---

## Writing Good Tests

### DO ✅

- **Test behavior, not implementation**
  ```php
  // Good: Tests what the user sees
  test('user can purchase tickets', function () {
      $response = $this->postJson('/api/ticket-orders', $data);
      $response->assertStatus(201);
  });
  
  // Bad: Tests internal implementation
  test('ticket service calls stripe', function () {
      // Don't test internal method calls
  });
  ```

- **One assertion concept per test**
  ```php
  // Good: One concept
  test('ticket order has correct total', function () {
      $order = TicketOrder::factory()->create(['total' => 55.00]);
      expect($order->total)->toBe(55.00);
  });
  
  // Bad: Multiple concepts
  test('ticket order is valid', function () {
      // Tests total, status, user, event, etc.
  });
  ```

- **Use factories, not seeders**
  ```php
  // Good
  $user = User::factory()->create();
  
  // Bad
  $this->seed(); // Don't use seeders in tests
  ```

- **Mock external services**
  ```php
  // Good: Mock external API
  Http::fake([
      'api.stripe.com/*' => Http::response(['id' => 'pi_123']),
  ]);
  
  // Bad: Hit real API
  // Don't make real HTTP calls in tests
  ```

- **Keep tests fast (< 500ms each)**
  - Use in-memory SQLite for tests
  - Mock slow operations
  - Avoid file I/O when possible

---

### DON'T ❌

- **Test framework code**
  ```php
  // Bad: Testing Laravel's built-in functionality
  test('model can be created', function () {
      $user = new User();
      expect($user)->toBeInstanceOf(User::class);
  });
  ```

- **Test trivial getters/setters**
  ```php
  // Bad: Testing simple accessors
  test('user has name', function () {
      $user = User::factory()->create(['name' => 'John']);
      expect($user->name)->toBe('John');
  });
  ```

- **Depend on test execution order**
  ```php
  // Bad: Test depends on previous test
  test('second test', function () {
      // Assumes first test ran and created data
  });
  ```

- **Hit real external APIs**
  ```php
  // Bad: Real API call
  $response = Http::get('https://api.example.com/data');
  
  // Good: Mocked
  Http::fake(['api.example.com/*' => Http::response(['data' => 'test'])]);
  ```

- **Create complex test setup**
  ```php
  // Bad: Too much setup
  test('something', function () {
      // 50 lines of setup code
  });
  
  // Good: Use factories and helpers
  test('something', function () {
      $user = User::factory()->create();
      // Test code
  });
  ```

---

## Test Environment Setup

### Required Environment Variables

All required environment variables should be set in `phpunit.xml`:

```xml
<env name="STRIPE_SECRET" value="sk_test_..."/>
<env name="DB_CONNECTION" value="sqlite"/>
<env name="DB_DATABASE" value=":memory:"/>
```

### Vite Manifest

Tests that hit frontend routes need a fake Vite manifest. This is handled automatically by `Tests\Helpers\ViteHelper`.

### Database

- Use SQLite in-memory for speed: `DB_DATABASE=:memory:`
- Use `RefreshDatabase` trait for clean state
- Don't use seeders - use factories

---

## When Tests Fail

### 1. Is it a real bug? → Fix the code

If the test reveals actual broken functionality:
- Fix the code, not the test
- Verify the fix with the test
- Consider if other code needs fixing

### 2. Is the test wrong? → Fix the test

If the test expectation is incorrect:
- Update the test to match current behavior
- Ensure the test is still valuable
- Document why the expectation changed

### 3. Is it flaky? → Quarantine + investigate

If the test passes sometimes, fails others:
- Move to `tests/Quarantine/`
- Create GitHub issue
- Investigate root cause
- Fix within 2 weeks

### 4. Is it low value? → Delete it

If the test doesn't protect anything important:
- Delete the test
- Document why in commit message
- Don't keep tests "just because"

---

## CI/CD Rules

### Test Execution Strategy

1. **Critical Tests** (`@group critical`)
   - Run first
   - Block deployment if failing
   - Must complete in < 2 minutes

2. **Standard Tests** (default)
   - Run after critical tests
   - Report failures but don't block
   - Full test suite

3. **Quarantine Tests** (`@group quarantine`)
   - Run separately
   - Non-blocking
   - Informational only

### GitHub Actions Workflow

```yaml
# Critical tests (blocking)
- name: Critical Tests
  run: php artisan test --group=critical

# Full test suite (non-blocking)
- name: Full Tests
  continue-on-error: true
  run: php artisan test --exclude-group=quarantine

# Quarantine tests (informational)
- name: Quarantine Tests
  continue-on-error: true
  run: php artisan test --group=quarantine || true
```

---

## Test Health Monitoring

### Weekly Review

- Review quarantine tests
- Check test execution time
- Identify flaky tests
- Remove low-value tests

### Metrics to Track

- Test execution time
- Pass/fail rate
- Quarantine test count
- Test coverage (informational)

---

## Examples

### Good Feature Test

```php
test('authenticated user can purchase tickets', function () {
    // Arrange
    $user = User::factory()->create();
    $event = Event::factory()->create();
    $ticketPlan = TicketPlan::factory()->create([
        'event_id' => $event->id,
        'price' => 25.00,
        'available_quantity' => 100,
    ]);
    
    // Act
    $response = $this->actingAs($user)->postJson('/api/ticket-orders', [
        'event_id' => $event->id,
        'items' => [
            ['ticket_plan_id' => $ticketPlan->id, 'quantity' => 2],
        ],
    ]);
    
    // Assert
    $response->assertStatus(201)
        ->assertJsonPath('total', '55.00');
    
    $this->assertDatabaseHas('ticket_orders', [
        'user_id' => $user->id,
        'total' => 55.00,
    ]);
});
```

### Good Unit Test

```php
test('calculates ticket order total correctly', function () {
    $ticketPlan = TicketPlan::factory()->create(['price' => 25.00]);
    $order = new TicketOrder();
    $order->items()->create([
        'ticket_plan_id' => $ticketPlan->id,
        'quantity' => 2,
        'price' => 25.00,
    ]);
    
    expect($order->calculateTotal())->toBe(55.00); // 50 + 10% fee
});
```

---

## Resources

- [Laravel Testing Documentation](https://laravel.com/docs/testing)
- [Pest PHP Documentation](https://pestphp.com/docs)
- [PHPUnit Documentation](https://phpunit.de/documentation.html)

---

## Questions?

If you're unsure about a test:
1. Ask the team
2. Review existing tests
3. Follow these standards
4. When in doubt, test behavior not implementation

