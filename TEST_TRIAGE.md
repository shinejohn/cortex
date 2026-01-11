# Test Triage Report
**Generated:** 2025-01-28  
**Total Tests:** 1,211  
**Passing:** 950  
**Failing:** 260  
**Skipped:** 1

---

## Summary

The test suite has **260 failing tests** blocking deployment. The majority of failures fall into **Category B (Environment Issues)** - missing configuration rather than actual bugs. A smaller number are **Category D (Outdated Tests)** - tests expecting frontend assets that don't exist.

---

## CATEGORY A: REAL BUGS (Must Fix)

### High Priority Security/Auth Issues
**Status:** Reviewing - Need to verify if these are real bugs or test setup issues

- Authentication tests failing due to environment setup
- Authorization tests may have real issues - need investigation

### Payment Processing
**Status:** Environment issue, not a bug
- All Stripe-related failures are due to missing `STRIPE_SECRET` in test environment
- Tests are correctly structured but need proper mocking or test keys

### Data Integrity
**Status:** Need investigation
- Review database constraint failures
- Check foreign key relationships

---

## CATEGORY B: ENVIRONMENT ISSUES (Fix Config)

### 1. Missing Stripe Configuration ⚠️ **HIGH PRIORITY**
**Impact:** ~50+ tests failing

**Error:**
```
RuntimeException: Stripe API secret not configured. Please set STRIPE_SECRET in your .env file.
```

**Affected Tests:**
- `Tests\Feature\TicketingSystemTest` (all 3 tests)
- `Tests\Feature\TicketPaymentIntegrationTest` (7 tests)
- `Tests\Feature\PromoCodeTest` (10 tests)
- Any test hitting routes that use `StripeConnectService`

**Root Cause:**
- `StripeConnectService` constructor throws exception if `STRIPE_SECRET` is not set
- `phpunit.xml` doesn't include `STRIPE_SECRET` environment variable
- Tests should either:
  1. Mock `StripeConnectService` 
  2. Set `STRIPE_SECRET` in `phpunit.xml` (use test key: `sk_test_...`)
  3. Use dependency injection to allow test doubles

**Fix:**
- Add `STRIPE_SECRET` to `phpunit.xml` with test key
- OR refactor `StripeConnectService` to allow null in test environment
- OR mock the service in tests

---

### 2. Missing Vite Manifest ⚠️ **HIGH PRIORITY**
**Impact:** ~100+ tests failing

**Error:**
```
Unable to locate file in Vite manifest: resources/js/pages/event-city/tickets/listing-show.tsx
```

**Affected Tests:**
- `Tests\Feature\TicketMarketplaceTest` (10 tests)
- `Tests\Feature\CalendarTest` (19 tests)
- `Tests\Feature\HubSystemTest` (9 tests)
- `Tests\Feature\CheckInSystemTest` (8 tests)
- Any test that hits routes rendering Inertia pages

**Root Cause:**
- Tests are hitting routes that render Blade templates with `@vite()` directive
- Vite manifest doesn't exist because assets aren't built before tests run
- Inertia is trying to resolve page components that don't exist in manifest

**Fix Options:**
1. **Build assets before tests** (already done in CI, but not locally)
2. **Mock Vite helper** in test environment
3. **Create test-specific blade template** that doesn't use Vite
4. **Skip Vite manifest check** in test environment

**Recommended:** Option 2 - Mock Vite in tests

---

### 3. Missing External Service Configuration
**Impact:** ~50+ tests failing

**Services needing configuration:**
- AWS credentials (S3, SNS)
- External APIs (SERP API, ScrapingBee, Prism AI, Unsplash)
- Redis (if used for caching)

**Affected Tests:**
- `Tests\Feature\Services\NewsWorkflow\*` (multiple)
- `Tests\Feature\Services\News\UnsplashImageStorageTest`
- Tests hitting services that make external API calls

**Fix:**
- Mock external services in tests
- Use test doubles instead of real API calls
- Add environment variables with placeholder values for tests

---

## CATEGORY C: FLAKY TESTS (Quarantine)

**Status:** Need to identify through multiple test runs

**Potential Flaky Tests:**
- Tests with timing dependencies
- Tests that depend on external APIs without mocks
- Tests with race conditions

**Action:** Create quarantine system and move flaky tests after identification

---

## CATEGORY D: OUTDATED TESTS (Delete or Rewrite)

### 1. Tests Expecting Non-Existent Frontend Files
**Impact:** ~20+ tests

**Issue:**
- Tests expect routes to work but frontend files don't exist
- Example: `resources/js/pages/event-city/tickets/listing-show.tsx` doesn't exist

**Fix:**
- Check if route/page was removed
- If removed: Delete test or update to match current implementation
- If should exist: Create the missing file

---

### 2. Tests for Removed Features
**Status:** Need investigation

**Action:** Review failing tests to identify if they test removed features

---

## CATEGORY E: LOW VALUE (Consider Deleting)

**Status:** Need review

**Potential Low-Value Tests:**
- Tests that just call a method and assert no exception
- Tests with no meaningful assertions
- Tests duplicating other tests

**Action:** Review after fixing Categories A-D

---

## Test Failure Breakdown by Test File

| Test File | Failures | Category | Priority |
|-----------|----------|----------|----------|
| `Tests\Feature\CalendarTest` | 19 | B (Vite) | High |
| `Tests\Feature\Services\NewsWorkflow\PublishingServiceTest` | 12 | B (External APIs) | Medium |
| `Tests\Feature\Services\NewsWorkflow\NewsWorkflowServiceTest` | 11 | B (External APIs) | Medium |
| `Tests\Feature\TicketMarketplaceTest` | 10 | B (Vite) | High |
| `Tests\Feature\PromoCodeTest` | 10 | B (Stripe) | High |
| `Tests\Feature\Services\NewsWorkflow\FactCheckingServiceTest` | 9 | B (External APIs) | Medium |
| `Tests\Feature\HubSystemTest` | 9 | B (Vite) | High |
| `Tests\Feature\CheckInSystemTest` | 8 | B (Vite) | High |
| `Tests\Feature\TicketPaymentIntegrationTest` | 7 | B (Stripe) | High |
| `Tests\Feature\StoreOwnerFunctionalityTest` | 7 | B (Vite/Stripe) | High |
| `Tests\Feature\RegionNewsSystemTest` | 7 | B (Vite) | High |
| `Tests\Feature\Api\V1\UserControllerTest` | 6 | B (Vite) | Medium |
| `Tests\Feature\Api\V1\TenantControllerTest` | 6 | B (Vite) | Medium |
| `Tests\Feature\Services\NewsWorkflow\ContentCurationServiceTest` | 5 | B (External APIs) | Medium |
| `Tests\Feature\Api\V1\WorkspaceControllerTest` | 5 | B (Vite) | Medium |
| `Tests\Feature\SocialGroupTest` | 4 | B (Vite) | Medium |
| `Tests\Feature\Services\News\UnsplashImageStorageTest` | 4 | B (External APIs) | Medium |
| `Tests\Unit\Models\ReviewTest` | 4 | ? | Low |
| `Tests\Feature\Jobs\News\ProcessPhase4FactCheckingJobTest` | 3 | B (External APIs) | Medium |
| `Tests\Unit\Models\CouponTest` | 3 | ? | Low |

---

## Immediate Action Plan

### Phase 1: Quick Wins (Unblock Deployment)
1. ✅ Add `STRIPE_SECRET` to `phpunit.xml` with test key
2. ✅ Mock Vite manifest for tests
3. ✅ Add missing environment variables to `phpunit.xml`
4. ✅ Update GitHub Actions workflow

### Phase 2: Fix Real Issues
1. Review Category A failures for actual bugs
2. Fix any real bugs found
3. Update tests that have wrong expectations

### Phase 3: Clean Up
1. Create quarantine system
2. Move flaky tests to quarantine
3. Delete/rewrite outdated tests
4. Remove low-value tests

### Phase 4: Establish Standards
1. Create `TESTING_STANDARDS.md`
2. Mark critical tests with `@group critical`
3. Update CI/CD with tiered test strategy
4. Set up weekly test health monitoring

---

## Next Steps

1. **Fix Category B issues** (Environment) - This will fix ~200+ tests
2. **Review Category A** (Real bugs) - Verify if any are actual bugs
3. **Create quarantine system** - Move flaky tests
4. **Update CI/CD** - Implement tiered testing strategy

---

## Notes

- Most failures are **environment configuration issues**, not code bugs
- Tests are well-structured but need proper test environment setup
- Once environment issues are fixed, we should see ~80%+ pass rate
- Remaining failures will need individual investigation

