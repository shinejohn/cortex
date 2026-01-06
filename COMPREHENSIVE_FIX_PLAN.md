# Comprehensive Platform Fix Plan - All Issues

**Created:** 2025-12-27  
**Status:** ACTIVE IMPLEMENTATION  
**Goal:** Fix ALL platform issues - Zero Deferred Maintenance

---

## Fix Order (Priority-Based)

### Phase 1: Critical Infrastructure (Blocks Everything)
1. ✅ Stripe Service Error Handling
2. ⏳ Service Registration (47 services)
3. ⏳ Database Schema Fixes
4. ⏳ Service Configuration

### Phase 2: Core Functionality
5. ⏳ Missing Controllers
6. ⏳ Type Errors
7. ⏳ Argument Count Errors

### Phase 3: UI & Consistency
8. ⏳ Inertia Component Paths
9. ⏳ Model ID Consistency

### Phase 4: Architecture & Quality
10. ⏳ Final Class Issues
11. ⏳ Test Mock Issues (fix tests, not code)

---

## Implementation Status

### ✅ COMPLETED
- None yet

### 🔄 IN PROGRESS
- Stripe Service Error Handling

### ⏳ PENDING
- All others

---

## Detailed Fix List

### 1. Stripe Service Error Handling
**File:** `app/Services/StripeConnectService.php`  
**Issue:** Crashes when STRIPE_SECRET is null  
**Fix:** Add validation and clear error message  
**Status:** IN PROGRESS

### 2. Service Registration
**File:** `app/Providers/AppServiceProvider.php`  
**Issue:** 47 services can't be resolved  
**Fix:** Register all services in register() method  
**Status:** PENDING

### 3. Database Schema
**Files:** `database/migrations/`  
**Issue:** Missing columns (events.slug, etc.)  
**Fix:** Create migrations to add missing columns  
**Status:** PENDING

### 4. Service Configuration
**File:** `config/services.php`  
**Issue:** Missing configs for VAPID, SMS, etc.  
**Fix:** Add all missing service configs  
**Status:** PENDING

### 5. Missing Controllers
**Files:** `app/Http/Controllers/`  
**Issue:** Controllers referenced but missing  
**Fix:** Verify/create missing controllers  
**Status:** PENDING

### 6. Type Errors
**Files:** Various  
**Issue:** Type mismatches cause runtime errors  
**Fix:** Add proper type hints, fix mismatches  
**Status:** PENDING

### 7. Argument Count Errors
**Files:** Various  
**Issue:** Wrong number of arguments  
**Fix:** Fix method calls or add defaults  
**Status:** PENDING

### 8. Inertia Component Paths
**Files:** `app/Http/Controllers/`  
**Issue:** Inconsistent component paths  
**Fix:** Create helper, standardize paths  
**Status:** PENDING

### 9. Model ID Consistency
**Files:** `app/Models/`, `database/migrations/`  
**Issue:** Mixed UUID and integer IDs  
**Fix:** Standardize on one approach  
**Status:** PENDING

### 10. Final Class Issues
**Files:** `app/Services/`  
**Issue:** 79 services are final, can't mock  
**Fix:** Create interfaces OR remove final strategically  
**Status:** PENDING

---

**Last Updated:** 2025-12-27  
**Next Action:** Fix Stripe Service

