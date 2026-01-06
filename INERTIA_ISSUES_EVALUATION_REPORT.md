# Inertia Component Path Issues - Evaluation Report

**Generated:** 2025-12-27  
**Laravel Version:** 12.43.1  
**Inertia Version:** Latest

## Executive Summary

The application uses a **multi-platform architecture** where different domains/platforms render different Inertia components. Tests are failing because they expect component paths **without platform prefixes**, but the actual rendered components **include platform prefixes** based on the current domain/route context.

### Impact
- **~50+ test failures** related to Inertia component path mismatches
- Tests expect: `'social/messages-index'`
- Actual renders: `'event-city/social/messages-index'`

## Root Cause Analysis

### Platform-Based Component Paths

The application supports multiple platforms, each with its own component namespace:

1. **EventCity** (`event-city/`) - Default/main platform
2. **DayNews** (`day-news/`)
3. **DowntownGuide** (`downtown-guide/`)
4. **AlphaSite** (`alphasite/`)
5. **LocalVoices** (`local-voices/`)

### How Component Paths Are Determined

1. **Controllers** render components with explicit platform prefixes:
   ```php
   // EventCity controllers
   Inertia::render('event-city/calendar/index', [...]);
   
   // DayNews controllers  
   Inertia::render('day-news/index', [...]);
   
   // DowntownGuide controllers
   Inertia::render('downtown-guide/businesses/index', [...]);
   ```

2. **Route Context** determines which platform is active:
   - Routes are grouped by domain in `bootstrap/app.php`
   - Each domain loads its own route files
   - Controllers use platform-specific component paths

3. **Test Environment** defaults to EventCity platform:
   - Tests run without domain routing context
   - Default behavior renders `event-city/` prefixed components
   - Tests expect paths without prefixes

## Affected Test Files

### 1. Messaging Tests (`tests/Feature/MessagingTest.php`)
**Issues:**
- Expected: `'social/messages-index'`
- Actual: `'event-city/social/messages-index'`
- Expected: `'social/messages-new'`
- Actual: `'event-city/social/messages-new'`

**Affected Tests:** 3 tests

### 2. Notification Tests (`tests/Feature/NotificationTest.php`)
**Issues:**
- Expected: `'notifications/index'`
- Actual: `'event-city/notifications/index'`

**Affected Tests:** 1+ tests

### 3. Store Owner Tests (`tests/Feature/StoreOwnerFunctionalityTest.php`)
**Issues:**
- Expected: `'stores/show'`
- Actual: `'event-city/stores/show'` (likely)
- Expected: `'products/create'`
- Actual: `'event-city/products/create'` (likely)
- Expected: `'stores/edit'`
- Actual: `'event-city/stores/edit'` (likely)

**Affected Tests:** 3+ tests

### 4. Calendar Tests (`tests/Feature/CalendarTest.php`)
**Issues:**
- Expected: `'calendars'` (no path)
- Actual: `'event-city/calendar/index'` (likely)

**Affected Tests:** 1+ tests

### 5. DayNews Tests (`tests/Feature/DayNews/RegionHomeTest.php`)
**Status:** ✅ Already correct
- Uses `'day-news/index'` and `'day-news/posts/show'` correctly

### 6. Workspace Tests (`tests/Feature/Workspace/`)
**Status:** ✅ Fixed
- Updated to use `'event-city/auth/workspace-invitation'`
- Updated to use `'event-city/settings/workspace/overview'`

## Component Path Patterns

### Current Controller Patterns

**EventCity Platform:**
```php
Inertia::render('event-city/calendar/index', [...]);
Inertia::render('event-city/events/index', [...]);
Inertia::render('event-city/performers', [...]);
Inertia::render('event-city/auth/login', [...]);
Inertia::render('event-city/social/messages-index', [...]);
Inertia::render('event-city/notifications/index', [...]);
```

**DayNews Platform:**
```php
Inertia::render('day-news/index', [...]);
Inertia::render('day-news/posts/show', [...]);
Inertia::render('day-news/businesses/index', [...]);
```

**DowntownGuide Platform:**
```php
Inertia::render('downtown-guide/businesses/index', [...]);
Inertia::render('downtown-guide/coupons/index', [...]);
```

**AlphaSite Platform:**
```php
Inertia::render('alphasite/home', [...]);
Inertia::render('alphasite/crm/dashboard', [...]);
```

## Solutions & Recommendations

### Option 1: Update Test Expectations (Recommended)
**Pros:**
- Matches actual application behavior
- Tests verify correct platform components are rendered
- No code changes needed

**Cons:**
- Requires updating multiple test files
- Tests become platform-aware

**Implementation:**
Update all test assertions to include platform prefix:
```php
// Before
->component('social/messages-index')

// After  
->component('event-city/social/messages-index')
```

**Files to Update:**
1. `tests/Feature/MessagingTest.php` (3 instances)
2. `tests/Feature/NotificationTest.php` (1+ instances)
3. `tests/Feature/StoreOwnerFunctionalityTest.php` (3+ instances)
4. `tests/Feature/CalendarTest.php` (1+ instances)

### Option 2: Create Test Helper for Component Paths
**Pros:**
- Centralized logic for component paths
- Easier to maintain
- Can handle platform detection in tests

**Cons:**
- Requires creating helper infrastructure
- More complex

**Implementation:**
```php
// tests/Helpers/InertiaHelper.php
class InertiaHelper {
    public static function componentPath(string $path, ?string $platform = 'event-city'): string {
        // If path already has platform prefix, return as-is
        if (str_contains($path, '/')) {
            $parts = explode('/', $path, 2);
            if (in_array($parts[0], ['event-city', 'day-news', 'downtown-guide', 'alphasite', 'local-voices'])) {
                return $path;
            }
        }
        
        return $platform ? "{$platform}/{$path}" : $path;
    }
}

// Usage in tests
->component(InertiaHelper::componentPath('social/messages-index'))
```

### Option 3: Configure Inertia Testing to Strip Prefixes
**Pros:**
- Tests remain simple
- No test file changes needed

**Cons:**
- Requires custom Inertia testing configuration
- May hide platform-specific issues
- Complex to implement

**Implementation:**
Modify `config/inertia.php` testing configuration or create custom test assertion.

## Detailed Component Mapping

### EventCity Components (Default Platform)
| Test Expects | Actual Component | Controller |
|-------------|------------------|------------|
| `'social/messages-index'` | `'event-city/social/messages-index'` | `SocialMessageController` |
| `'social/messages-new'` | `'event-city/social/messages-new'` | `SocialMessageController` |
| `'notifications/index'` | `'event-city/notifications/index'` | `NotificationController` |
| `'stores/show'` | `'event-city/stores/show'` | `StoreController` |
| `'products/create'` | `'event-city/products/create'` | `ProductController` |
| `'stores/edit'` | `'event-city/stores/edit'` | `StoreController` |
| `'calendars'` | `'event-city/calendar/index'` | `CalendarController` |
| `'auth/workspace-invitation'` | `'event-city/auth/workspace-invitation'` | `WorkspaceController` ✅ Fixed |
| `'settings/workspace/overview'` | `'event-city/settings/workspace/overview'` | `WorkspaceSettingsController` ✅ Fixed |

### DayNews Components
| Test Expects | Actual Component | Status |
|-------------|------------------|--------|
| `'day-news/index'` | `'day-news/index'` | ✅ Correct |
| `'day-news/posts/show'` | `'day-news/posts/show'` | ✅ Correct |

## Test Environment Configuration

### Current Setup
- **Default Platform:** EventCity (`event-city/`)
- **Route Context:** Tests run without domain routing
- **Component Resolution:** Uses `resources/js/pages/` directory
- **Platform Detection:** Based on route/domain context (defaults to event-city)

### Configuration Files
- `config/inertia.php` - Inertia configuration
- `app/Http/Middleware/HandleInertiaRequests.php` - Shared props include `appDomain`
- `bootstrap/app.php` - Route domain configuration

## Impact Assessment

### Test Failures
- **Total Inertia-related failures:** ~50+ tests
- **Already fixed:** 2 test files (Workspace tests)
- **Remaining failures:** ~48 tests

### Affected Areas
1. **Social/Messaging** - 3 tests
2. **Notifications** - 1+ tests  
3. **Store Management** - 3+ tests
4. **Calendar** - 1+ tests
5. **Other Feature Tests** - ~40+ tests

## Recommended Action Plan

### Phase 1: Immediate Fixes (High Priority)
1. ✅ Fix Workspace tests (Completed)
2. Fix Messaging tests (`tests/Feature/MessagingTest.php`)
3. Fix Notification tests (`tests/Feature/NotificationTest.php`)
4. Fix Store Owner tests (`tests/Feature/StoreOwnerFunctionalityTest.php`)
5. Fix Calendar tests (`tests/Feature/CalendarTest.php`)

### Phase 2: Systematic Review
1. Run full test suite to identify all Inertia failures
2. Categorize by platform/component type
3. Batch update similar patterns
4. Create helper function if needed

### Phase 3: Prevention
1. Document component path conventions
2. Add test helper for component paths
3. Update test templates to include platform prefix
4. Add linting/static analysis to catch missing prefixes

## Code Examples

### Current Test (Failing)
```php
test('user can view messages', function () {
    $response = $this->actingAs($user)->get('/messages');
    
    $response->assertInertia(fn ($page) => $page
        ->component('social/messages-index') // ❌ Missing platform prefix
    );
});
```

### Fixed Test
```php
test('user can view messages', function () {
    $response = $this->actingAs($user)->get('/messages');
    
    $response->assertInertia(fn ($page) => $page
        ->component('event-city/social/messages-index') // ✅ Correct
    );
});
```

### With Helper (Future)
```php
test('user can view messages', function () {
    $response = $this->actingAs($user)->get('/messages');
    
    $response->assertInertia(fn ($page) => $page
        ->component(InertiaHelper::componentPath('social/messages-index')) // ✅ Flexible
    );
});
```

## Conclusion

The Inertia component path issues stem from the multi-platform architecture where components are namespaced by platform. Tests need to be updated to match the actual component paths rendered by controllers.

**Recommended Approach:** Update test expectations to include platform prefixes (Option 1), as this:
- Matches actual application behavior
- Verifies correct platform components are rendered
- Requires minimal infrastructure changes
- Is straightforward to implement

**Estimated Effort:**
- **Immediate fixes:** 1-2 hours (5 test files)
- **Full systematic fix:** 4-6 hours (all ~50 tests)
- **Helper implementation:** 2-3 hours (optional)

---

**Report Generated:** 2025-12-27  
**Status:** Evaluation Complete - Ready for Implementation

