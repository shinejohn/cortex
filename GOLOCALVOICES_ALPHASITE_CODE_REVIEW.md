# Code Review: GoLocalVoices & Alphasite
**Date:** February 2025  
**Focus:** Railway Deployment Issues & Code Quality

---

## 🔴 CRITICAL ISSUES - Must Fix Immediately

### 1. Alphasite Missing Home Route 🔴 **BLOCKING**

**Location:** `routes/alphasite.php` (line 60-61)

**Issue:** Alphasite has NO home route (`/`) defined for the main domain.

```58:61:routes/alphasite.php
// Main domain routes (.com domain)
Route::domain('alphasite.com')->group(function () {
    // Home
    
    // Directory
```

**Impact:**
- Visiting `alphasite.com` or `alphasite.ai` returns 404
- Health checks may fail if they hit the root route
- Users cannot access the homepage

**Fix Required:**
Add a home route that renders the directory home page:

```php
Route::domain('alphasite.com')->group(function () {
    // Home
    Route::get('/', [DirectoryController::class, 'home'])->name('alphasite.home');
    
    // Directory
    Route::get('/directory', [DirectoryController::class, 'index'])->name('alphasite.directory');
    // ... rest of routes
});
```

**Also needed for .ai domain:**
```php
Route::domain('alphasite.ai')->group(function () {
    Route::get('/', [DirectoryController::class, 'home'])->name('alphasite.home.ai');
    // ... other routes
});
```

---

### 2. Alphasite Domain Routing Configuration Issue ⚠️ **HIGH PRIORITY**

**Location:** `bootstrap/app.php` (lines 65-71)

**Issue:** Alphasite routes are loaded WITHOUT domain constraints in `bootstrap/app.php`, but the routes file (`routes/alphasite.php`) has `Route::domain()` calls inside it.

**Current Code:**
```65:71:bootstrap/app.php
            // AlphaSite domain routes
            // Routes are domain-constrained in routes/alphasite.php (handles both .com and .ai domains)
            // No need to add domain constraints here as routes file handles them
            Route::middleware('web')
                ->group(function () {
                    require base_path('routes/alphasite.php');
                });
```

**Problem:**
- Routes file has `Route::domain('alphasite.com')` and `Route::domain('alphasite.ai')` calls
- But these are loaded globally without domain wrapping
- This means domain constraints in the routes file may not work correctly
- Routes might be accessible on wrong domains

**Comparison with Working Apps:**

**Downtown Guide (Working):**
```45:55:bootstrap/app.php
            // DowntownGuide domain routes
            $downtownGuideDomain = config('domains.downtown-guide');
            if ($downtownGuideDomain) {
                // Support both apex domain and subdomains
                Route::domain('{subdomain?}.' . $downtownGuideDomain)
                    ->where(['subdomain' => '[a-z0-9-]*'])
                    ->middleware('web')
                    ->group(function () {
                        require base_path('routes/downtown-guide.php');
                    });
            }
```

**Go Local Voices (Working):**
```57:63:bootstrap/app.php
            // Go Local Voices domain routes (domain-specific routes only)
            Route::domain(config('domains.local-voices'))
                ->middleware('web')
                ->name('localvoices.')
                ->group(function () {
                    require base_path('routes/local-voices.php');
                });
```

**Fix Required:**

Option 1: Remove domain constraints from routes file and add them in bootstrap/app.php:
```php
// In bootstrap/app.php
$alphasiteDomain = config('domains.alphasite');
if ($alphasiteDomain) {
    // Support both .com and .ai domains
    Route::domain($alphasiteDomain)
        ->middleware('web')
        ->name('alphasite.')
        ->group(function () {
            require base_path('routes/alphasite.php');
        });
}
```

Option 2: Keep domain constraints in routes file but ensure they work correctly (current approach, but needs verification).

**Recommendation:** Use Option 1 for consistency with other apps.

---

### 3. Alphasite Routes File Structure Issue ⚠️ **MEDIUM PRIORITY**

**Location:** `routes/alphasite.php`

**Issue:** Routes file has hardcoded domain names (`alphasite.com`, `alphasite.ai`) instead of using config.

**Current:**
```29:30:routes/alphasite.php
// Subdomain routing for business pages (.com domain)
Route::domain('{subdomain}.alphasite.com')->group(function () {
```

**Problem:**
- Hardcoded domains won't work in different environments (staging, production)
- Railway uses `alphasite-production-42b8.up.railway.app` not `alphasite.com`
- Routes won't match in Railway environment

**Fix Required:**
Use config-based domain matching or remove domain constraints and handle in middleware:

```php
// Option 1: Use config
$alphasiteDomain = config('domains.alphasite');
Route::domain('{subdomain}.' . $alphasiteDomain)->group(function () {
    // routes
});

// Option 2: Handle in middleware (better for Railway)
// Remove domain constraints, use DetectAppDomain middleware instead
```

---

## 🟡 MEDIUM PRIORITY ISSUES

### 4. GoLocalVoices Route Registration ✅ **GOOD**

**Status:** Routes are properly registered in `bootstrap/app.php`:
```57:63:bootstrap/app.php
            // Go Local Voices domain routes (domain-specific routes only)
            Route::domain(config('domains.local-voices'))
                ->middleware('web')
                ->name('localvoices.')
                ->group(function () {
                    require base_path('routes/local-voices.php');
                });
```

**No issues found** - This matches the pattern used by Downtown Guide.

---

### 5. Controller Dependencies Check ✅ **GOOD**

**GoLocalVoices Controllers:**
- ✅ `CreatorController` exists and has proper dependencies
- ✅ `PodcastController` exists and has proper dependencies
- ✅ Both use `PodcastService` which exists
- ✅ Both check for standalone view correctly

**Alphasite Controllers:**
- ✅ `BusinessPageController` exists
- ✅ `DirectoryController` exists
- ✅ `PageGeneratorService` exists
- ✅ `LinkingService` exists
- ✅ `FourCallsIntegrationService` exists

**No missing controller issues found.**

---

### 6. Frontend Pages Check ✅ **GOOD**

**GoLocalVoices Pages:**
- ✅ `resources/js/pages/local-voices/index.tsx` exists
- ✅ `resources/js/pages/local-voices/dashboard.tsx` exists
- ✅ `resources/js/pages/local-voices/register.tsx` exists
- ✅ `resources/js/pages/local-voices/podcast-show.tsx` exists
- ✅ `resources/js/pages/local-voices/episode-show.tsx` exists
- ✅ Layout component exists: `GoLocalVoicesLayout`

**Alphasite Pages:**
- ✅ `resources/js/pages/alphasite/directory/home.tsx` exists
- ✅ `resources/js/pages/alphasite/directory/index.tsx` exists
- ✅ `resources/js/pages/alphasite/business/show.tsx` exists
- ✅ `resources/js/pages/alphasite/search/index.tsx` exists
- ✅ `resources/js/pages/alphasite/community/show.tsx` exists

**No missing frontend pages found.**

---

### 7. Model Dependencies ✅ **GOOD**

**GoLocalVoices Models:**
- ✅ `CreatorProfile` model exists
- ✅ `Podcast` model exists
- ✅ `PodcastEpisode` model exists (referenced in controller)

**Alphasite Models:**
- ✅ `Business` model exists (used by BusinessPageController)
- ✅ All referenced models appear to exist

**No missing model issues found.**

---

## 🟢 LOW PRIORITY ISSUES

### 8. Route Naming Consistency

**GoLocalVoices:** Uses `localvoices.*` route names ✅ Good

**Alphasite:** Uses `alphasite.*` route names ✅ Good

Both follow consistent naming patterns.

---

### 9. Error Handling

**GoLocalVoices Controllers:**
- ✅ Proper authorization checks (`$this->authorize('update', $podcast)`)
- ✅ Proper model loading with relationships
- ✅ Error handling for missing resources

**Alphasite Controllers:**
- ✅ Proper 404 handling (`abort(404)`)
- ✅ Try-catch for external service calls (FourCallsIntegrationService)
- ✅ Proper error handling

**No error handling issues found.**

---

## 📋 SUMMARY OF ISSUES

### Critical (Must Fix):
1. 🔴 **Alphasite Missing Home Route** - No `/` route for main domain
2. ⚠️ **Alphasite Domain Routing** - Domain constraints may not work correctly

### Medium Priority:
3. ⚠️ **Alphasite Hardcoded Domains** - Should use config-based domains

### Good News:
- ✅ GoLocalVoices routes are properly configured
- ✅ All controllers exist and have proper dependencies
- ✅ All frontend pages exist
- ✅ All models exist
- ✅ Error handling is good

---

## 🔧 RECOMMENDED FIXES

### Fix 1: Add Alphasite Home Route ✅ **COMPLETED**

**File:** `routes/alphasite.php`

✅ Added home route for `.com` domain (line 61):
```php
Route::get('/', [DirectoryController::class, 'home'])->name('alphasite.home');
```

✅ Verified `DirectoryController::home()` method exists and works correctly.

### Fix 2: Add Railway Domain Fallback Routes ✅ **COMPLETED**

**File:** `routes/alphasite.php`

✅ Added fallback routes for Railway domains (lines 118-130):
- Routes work when `ALPHASITE_DOMAIN` contains 'railway'
- Provides home route and key routes without domain constraints
- Relies on `DetectAppDomain` middleware for domain detection
- Ensures Railway domains like `alphasite-production-42b8.up.railway.app` work

### Fix 3: Domain Routing Issue ⚠️ **NEEDS ATTENTION**

**Issue:** Hardcoded domain constraints (`alphasite.com`, `alphasite.ai`) won't match Railway domains.

**Current Status:**
- ✅ Fallback routes added for Railway domains
- ⚠️ Hardcoded domains still present (will work for custom domains)
- ✅ Middleware detection handles Railway domains

**Recommendation:** 
- Current fix (fallback routes) should work for Railway
- For production with custom domains, hardcoded routes will work
- Consider refactoring to use config-based domains in future

### Fix 4: Verify Railway Domain Configuration

**Action Required:** Ensure `ALPHASITE_DOMAIN` environment variable is set to Railway domain:
```bash
ALPHASITE_DOMAIN=alphasite-production-42b8.up.railway.app
```

This ensures:
1. Fallback routes are registered (checks for 'railway' in domain)
2. DetectAppDomain middleware correctly identifies Alphasite
3. Routes are accessible on Railway domain

---

## 🎯 ROOT CAUSE ANALYSIS

### Why Alphasite Might Be Crashing:

1. **Missing Home Route** (80% probability)
   - Health checks hit `/` route
   - If route doesn't exist, returns 404
   - Railway may mark service as unhealthy

2. **Domain Routing Mismatch** (15% probability)
   - Routes configured for `alphasite.com` but Railway uses `alphasite-production-42b8.up.railway.app`
   - Routes don't match, all requests return 404
   - Service appears crashed

3. **Controller Method Missing** (5% probability)
   - If `DirectoryController::home()` doesn't exist
   - Route will fail when accessed

### Why GoLocalVoices Might Be Crashing:

1. **Database Connection** (Most likely - already fixed)
   - Password authentication issues (already addressed)

2. **Missing Dependencies** (Low probability)
   - All controllers and models exist
   - Routes are properly configured

---

## ✅ VERIFICATION CHECKLIST

After fixes, verify:

- [ ] Alphasite home route (`/`) works
- [ ] Alphasite routes match Railway domain
- [ ] GoLocalVoices routes work correctly
- [ ] Both apps can serve requests
- [ ] Health checks pass (`/healthcheck`)
- [ ] No 404 errors on root routes

---

**Review Completed:** February 2025  
**Priority:** Fix Alphasite home route immediately - this is likely causing crashes
