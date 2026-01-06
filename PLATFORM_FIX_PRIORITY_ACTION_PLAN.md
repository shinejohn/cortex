# Platform Fix Priority Action Plan

**Generated:** 2025-12-27  
**Total Issues:** 12 categories, 310 failing tests  
**Focus:** Fix platform/app issues, not just tests

---

## Quick Reference: What Needs Fixing

### 🔴 CRITICAL (Blocks Core Features)

#### 1. Service Binding Resolution (47 tests)
**Problem:** Services can't be resolved - they exist but Laravel can't find them  
**Fix:** Register all 47 services in `AppServiceProvider`  
**Time:** 4-6 hours  
**Impact:** Core functionality broken

#### 2. Stripe Configuration (15+ tests)  
**Problem:** Stripe services crash because API keys missing  
**Fix:** Add error handling + document required env vars  
**Time:** 1 hour  
**Impact:** Payment/billing completely broken

#### 3. Database Schema Mismatches (25+ tests)
**Problem:** Models expect columns that don't exist (e.g., `events.slug`)  
**Fix:** Create migrations to add missing columns  
**Time:** 4-6 hours  
**Impact:** Data can't be saved

#### 4. Missing Controllers (5+ tests)
**Problem:** Routes reference controllers that don't exist or wrong namespace  
**Fix:** Verify/create controllers, fix namespaces  
**Time:** 1-2 hours  
**Impact:** Pages return 500 errors

---

### 🟡 HIGH PRIORITY (Affects User Experience)

#### 5. Service Configuration (10+ tests)
**Problem:** Services crash because env vars missing (VAPID, SMS, etc.)  
**Fix:** Add config validation + document all required vars  
**Time:** 2 hours  
**Impact:** Notifications/SMS broken

#### 6. Type Errors (5+ tests)
**Problem:** Wrong data types passed to methods  
**Fix:** Add type hints, fix method signatures  
**Time:** 2-3 hours  
**Impact:** Runtime crashes

#### 7. Argument Count Errors (4 tests)
**Problem:** Methods called with wrong number of arguments  
**Fix:** Fix method calls or add default parameters  
**Time:** 1 hour  
**Impact:** Fatal errors

---

### 🟢 MEDIUM PRIORITY (Code Quality)

#### 8. Final Class Mocking (5+ tests)
**Problem:** 79 services are `final`, can't be mocked  
**Fix:** Create interfaces OR remove `final` keyword  
**Time:** 3-4 hours  
**Impact:** Testing difficult

#### 9. Inertia Component Paths (48+ tests)
**Problem:** Component paths inconsistent (some have prefix, some don't)  
**Fix:** Standardize with helper function  
**Time:** 4-6 hours  
**Impact:** Pages may not render correctly

#### 10. Model ID Types (15+ tests)
**Problem:** Inconsistent ID types (UUID vs integer)  
**Fix:** Standardize on one approach  
**Time:** 2-3 hours  
**Impact:** Type errors, test failures

---

### 🔵 LOW PRIORITY (Test Infrastructure)

#### 11. Mockery Expectations (10+ tests)
**Problem:** Mock expectations don't match actual calls  
**Fix:** Update test mocks to match real behavior  
**Time:** 3-4 hours  
**Impact:** Tests fail, but code works

#### 12. Other Issues (15+ tests)
**Problem:** Various specific problems  
**Fix:** Address individually  
**Time:** 4-6 hours  
**Impact:** Varies

---

## Implementation Order (Recommended)

### Sprint 1: Critical Infrastructure (Week 1)
**Goal:** Get core features working

1. **Day 1: Stripe & Config** (3 hours)
   - Fix StripeConnectService error handling
   - Add service config validation
   - Document all required env vars
   - **Result:** Payment features work, clear error messages

2. **Day 2-3: Service Registration** (8 hours)
   - Register all 47 services in AppServiceProvider
   - Fix dependency injection issues
   - Verify all services resolvable
   - **Result:** Services work, no BindingResolutionException

3. **Day 4: Controllers** (2 hours)
   - Verify all controllers exist
   - Fix namespace issues
   - **Result:** Routes work, no 500 errors

4. **Day 5: Database Schema** (6 hours)
   - Audit model vs migration mismatches
   - Create migrations for missing columns
   - Fix constraint violations
   - **Result:** Data can be saved, no QueryException

**Sprint 1 Result:** ~92 tests fixed, core features functional

---

### Sprint 2: Code Quality (Week 2)
**Goal:** Improve code quality and consistency

1. **Day 1-2: Type Safety** (4 hours)
   - Fix type errors
   - Fix argument count errors
   - Add type hints where missing
   - **Result:** No runtime type errors

2. **Day 3-4: Final Classes** (4 hours)
   - Create interfaces for services that need mocking
   - OR remove `final` keyword strategically
   - **Result:** Services testable

3. **Day 5: ID Standardization** (3 hours)
   - Standardize on UUID or integer IDs
   - Update models/factories consistently
   - **Result:** Consistent ID handling

**Sprint 2 Result:** ~24 tests fixed, code quality improved

---

### Sprint 3: Frontend & Polish (Week 3)
**Goal:** Fix UI and remaining issues

1. **Day 1-3: Inertia Paths** (6 hours)
   - Create InertiaHelper for consistent paths
   - Update all controllers to use helper
   - **Result:** All pages render correctly

2. **Day 4-5: Remaining Issues** (6 hours)
   - Fix Mockery expectations
   - Address other specific issues
   - **Result:** All tests pass

**Sprint 3 Result:** ~58 tests fixed, platform complete

---

## Immediate Actions (Today)

### 1. Fix Stripe Service (30 minutes)
```php
// app/Services/StripeConnectService.php
public function __construct() {
    $secret = config('services.stripe.secret');
    
    if (empty($secret)) {
        throw new \RuntimeException(
            'Stripe API secret not configured. Please set STRIPE_SECRET in .env'
        );
    }
    
    \Stripe\Stripe::setApiKey($secret);
    $this->stripe = new \Stripe\StripeClient($secret);
}
```

### 2. Register Services (2 hours)
```php
// app/Providers/AppServiceProvider.php
public function register(): void {
    // Existing
    $this->app->bind(GeocodingServiceInterface::class, GeocodingService::class);
    
    // Add all services
    $services = [
        \App\Services\AlphaSite\CommunityService::class,
        \App\Services\AlphaSite\LinkingService::class,
        \App\Services\AlphaSite\PageGeneratorService::class,
        \App\Services\AlphaSite\SMBCrmService::class,
        \App\Services\AlphaSite\SubscriptionLifecycleService::class,
        \App\Services\AlphaSite\TemplateService::class,
        \App\Services\DayNews\AnnouncementService::class,
        \App\Services\DayNews\ArchiveService::class,
        \App\Services\DayNews\AuthorService::class,
        \App\Services\DayNews\ClassifiedService::class,
        \App\Services\DayNews\PhotoService::class,
        \App\Services\DayNews\PodcastService::class,
        \App\Services\DayNews\SearchService::class,
        \App\Services\DayNews\TagService::class,
        \App\Services\DayNews\TrendingService::class,
        \App\Services\News\ArticleGenerationService::class,
        \App\Services\News\BusinessDiscoveryService::class,
        \App\Services\News\ContentCurationService::class,
        \App\Services\News\ContentShortlistingService::class,
        \App\Services\News\EventExtractionService::class,
        \App\Services\News\EventPublishingService::class,
        \App\Services\News\FactCheckingService::class,
        \App\Services\News\FetchFrequencyService::class,
        \App\Services\News\ImageStorageService::class,
        \App\Services\News\NewsCollectionService::class,
        \App\Services\News\NewsWorkflowService::class,
        \App\Services\News\PerformerMatchingService::class,
        \App\Services\News\PrismAiService::class,
        \App\Services\News\PublishingService::class,
        \App\Services\News\ScrapingBeeService::class,
        \App\Services\News\SerpApiService::class,
        \App\Services\News\UnsplashService::class,
        \App\Services\News\VenueMatchingService::class,
        \App\Services\News\WorkflowSettingsService::class,
    ];
    
    foreach ($services as $service) {
        $this->app->singleton($service);
    }
}
```

### 3. Add Missing Event Slug Column (15 minutes)
```php
// database/migrations/YYYY_MM_DD_add_slug_to_events_table.php
Schema::table('events', function (Blueprint $table) {
    $table->string('slug')->nullable()->unique()->after('title');
});
```

### 4. Update Service Configs (30 minutes)
```php
// config/services.php - Add missing configs
'webpush' => [
    'public_key' => env('VAPID_PUBLIC_KEY'),
    'private_key' => env('VAPID_PRIVATE_KEY'),
    'subject' => env('VAPID_SUBJECT', 'mailto:notifications@shine.com'),
],

'sms' => [
    'provider' => env('SMS_PROVIDER', 'twilio'),
    'api_key' => env('SMS_API_KEY'),
    'api_secret' => env('SMS_API_SECRET'),
    'from_number' => env('SMS_FROM_NUMBER'),
],
```

---

## Success Metrics

### After Sprint 1:
- ✅ Stripe services work
- ✅ All services resolvable
- ✅ Routes work (no 500 errors)
- ✅ Data can be saved
- **Target:** ~92 tests passing

### After Sprint 2:
- ✅ No type errors
- ✅ Services testable
- ✅ Consistent ID handling
- **Target:** ~116 tests passing

### After Sprint 3:
- ✅ All pages render
- ✅ All tests pass
- ✅ Platform fully functional
- **Target:** 1,177 tests passing (100%)

---

## Risk Assessment

### High Risk:
- **Database migrations** - Can break production if not careful
- **Service registration** - May break existing functionality
- **Mitigation:** Test in staging, backup database, gradual rollout

### Medium Risk:
- **Removing `final`** - May allow unintended extension
- **Mitigation:** Use interfaces instead, or be selective

### Low Risk:
- **Config additions** - Just adds new options
- **Type hints** - Improves code quality
- **Inertia paths** - Mostly cosmetic

---

## Dependencies

### Must Fix First:
1. Service binding (blocks everything)
2. Stripe config (blocks payments)
3. Database schema (blocks data)

### Can Fix in Parallel:
- Service configs
- Type errors
- Argument counts

### Fix Last:
- Mockery expectations (test-only)
- Other test issues

---

**Plan Status:** Ready for Implementation  
**Next Step:** Begin Sprint 1, Day 1 - Fix Stripe & Service Configs

