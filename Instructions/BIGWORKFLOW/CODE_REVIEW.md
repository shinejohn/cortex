# BIGWORKFLOW — Full Code Review

**Review Date:** 2026-02-16  
**Updated:** 2026-02-16 — All critical and high-priority issues **FIXED**  
**Scope:** All 15 tasks, migrations, services, jobs, models, controllers, config

---

## Executive Summary

~~Several **critical** issues prevent the rollout and monthly refresh from running.~~ **All critical issues have been resolved.**

**Fixes applied:**
1. Config: Added dense_categories, sparse_categories, text_search_queries, throttle_ms
2. GooglePlacesService: Implemented searchTextPlaces, searchTextQuery, getDiscoveryFieldMask; dense/sparse routing
3. BusinessDiscoveryService: Public evaluateAndSetupNewsSource with CommunityRollout; community_id in upsertBusiness; assignToRegion accepts CommunityRollout
4. Region model: Added community_id to fillable, community() relationship
5. Migration: Removed state_code unique (allows re-rollouts)
6. ProcessCommunityRolloutJob: Passes CommunityRollout to assignToRegion (website scans dispatched)
7. ContentRoutingService: routeToEvent now creates Event records

---

## CRITICAL — Will Cause Runtime Failure

### 1. GooglePlacesService Missing searchTextPlaces() and searchTextQuery()

**Files:** `app/Services/News/GooglePlacesService.php`

**Problem:** `ProcessCommunityRolloutJob` and `ProcessMonthlyRefreshJob` both call:
- `$googlePlaces->searchTextPlaces($region, $category)` — **does not exist**
- `$googlePlaces->searchTextQuery($region, $query)` — **does not exist**

The current `GooglePlacesService` only has:
- `discoverBusinessesForCategory()` — routes to `searchNearbyPlaces()` only (no Text Search)
- `searchNearbyPlaces()` — private
- `parseBusinessData()`, `fetchAndStorePhotos()`, etc.

**Impact:** `ProcessCommunityRolloutJob` and `ProcessMonthlyRefreshJob` will throw `Call to undefined method searchTextPlaces()` on first execution.

**Fix:** Implement TASK-04/05 as specified:
- Add `searchTextPlaces(Region $region, string $category, ?string $fieldMask = null): array`
- Add `searchTextQuery(Region $region, string $query, ?string $fieldMask = null): array`
- Add `getDiscoveryFieldMask(): string` (Essentials-only)
- Update `discoverBusinessesForCategory()` to route dense categories → Text Search, sparse → Nearby Search

---

### 2. Config Missing dense_categories, sparse_categories, text_search_queries

**File:** `config/news-workflow.php`

**Problem:** `business_discovery` section has only `categories`. The jobs expect:
- `config('news-workflow.business_discovery.dense_categories', [])` — **returns []**
- `config('news-workflow.business_discovery.sparse_categories', [])` — **returns []**
- `config('news-workflow.business_discovery.text_search_queries', [])` — **returns []**

**Impact:** ProcessCommunityRolloutJob will iterate over empty arrays — no businesses discovered. ProcessMonthlyRefreshJob same.

**Fix:** Add to `config/news-workflow.php` under `business_discovery`:
```php
'dense_categories' => ['restaurant', 'cafe', 'bar', ...],  // 16 items
'sparse_categories' => ['hospital', 'pharmacy', ...],     // 74 items
'text_search_queries' => ['accounting firms', ...],      // 12 items
```

---

### 3. ProcessCommunityRolloutJob Calls Private evaluateAndSetupNewsSource() with Wrong Signature

**Files:** `app/Jobs/Rollout/ProcessCommunityRolloutJob.php`, `app/Services/News/BusinessDiscoveryService.php`

**Problem:**
- Job calls: `$businessDiscovery->evaluateAndSetupNewsSource($business, $cr)` where `$cr` is `CommunityRollout`
- Service has: `private function evaluateAndSetupNewsSource(Business $business, Region $region)`
- Cannot call private method from outside
- Type mismatch: `CommunityRollout` vs `Region`

**Impact:** Fatal error: Call to private method.

**Fix:** Either:
- (A) Add public overload: `evaluateAndSetupNewsSource(Business $business, Region $region, ?CommunityRollout $cr = null)` and dispatch `ProcessWebsiteScanJob` when `$cr` is present for rollout tracking; or
- (B) Remove the call from ProcessCommunityRolloutJob — `assignToRegion()` already calls `evaluateAndSetupNewsSource` internally, but that doesn't support CommunityRollout for `news_sources_created` increment. The TASK-08 spec said to dispatch ProcessWebsiteScanJob from evaluateAndSetupNewsSource — so the flow needs to support both assignToRegion (no CR) and rollout (with CR for metrics).

---

## HIGH — Design / Schema Issues

### 4. StateRollout state_code UNIQUE Prevents Re-Rollouts

**File:** `database/migrations/2026_02_16_000002_create_state_rollout_tables.php`

**Problem:** `$table->string('state_code', 2)->unique()` — only one rollout per state ever. After completing CA, you cannot run another CA rollout.

**Impact:** Cannot re-roll a state (e.g., after adding new categories or fixing bugs).

**Fix:** Remove unique, add index. Use `latest()` when querying by state_code to get most recent.

---

### 5. Region Model Missing community_id and community()

**File:** `app/Models/Region.php`

**Problem:** Migration adds `community_id` to regions. Region model does not have:
- `community_id` in fillable
- `community()` relationship

**Impact:** `$region->community_id` in BusinessDiscoveryService and WebsiteScannerService may work (column exists) but Region model won't eager-load or cast it properly. `$region->community` will fail.

**Fix:** Add to Region model:
```php
'community_id' => $fillable,
public function community(): BelongsTo { return $this->belongsTo(Community::class); }
```

---

### 6. BusinessDiscoveryService upsertBusiness() Does Not Set community_id

**File:** `app/Services/News/BusinessDiscoveryService.php`

**Problem:** `upsertBusiness()` builds `$businessFields` but never sets `community_id`. TASK-01 added community_id to Business; the service should set it from `$region->community_id ?? $region->community?->id`.

**Impact:** New businesses created during rollout won't have community_id, breaking `Business::where('community_id', $community->id)` in ProcessMonthlyRefreshJob.

**Fix:** Add `'community_id' => $region->community_id ?? $region->community?->id` to create/update.

---

### 7. NewsSource firstOrCreate Uses customer_status vs is_potential_customer

**File:** `app/Services/News/BusinessDiscoveryService.php`

**Problem:** Uses `'customer_status' => 'prospect'`. NewsSource fillable has both `is_potential_customer` and `customer_status`. WebsiteScannerService uses `is_potential_customer => true`. Inconsistent.

**Impact:** Minor — both may work if DB has both columns. Verify schema.

---

### 8. ContentRoutingService routeToEvent() Does Not Create Events

**File:** `app/Services/Newsroom/ContentRoutingService.php`

**Problem:** `routeToEvent()` logs and returns true but never creates an Event. It sets `$raw->update(['event_id' => null])` — clears event_id.

**Impact:** Events detected in RawContent are never persisted to Event model.

**Fix:** Implement actual Event creation from `$raw->event_data`.

---

## MEDIUM — Logic / Completeness

### 9. ProcessCommunityRolloutJob Phases 2–6 Are Stubs

**File:** `app/Jobs/Rollout/ProcessCommunityRolloutJob.php`

**Problem:** Phases 2–6 only call `startPhase()` and `completePhase()` immediately. No website scanning, news source creation, or verification.

**Impact:** Rollout completes Phase 1 (discovery) but Phases 2–6 do nothing. TASK-07 WebsiteScannerService exists but is never invoked from the job. ProcessWebsiteScanJob exists but is never dispatched from ProcessCommunityRolloutJob.

**Fix:** Phase 2 should dispatch ProcessWebsiteScanJob for businesses with websites (or use evaluateAndSetupNewsSource which would do that). Phases 3–6 need implementation per spec.

---

### 10. CommunityRollout startPhase(6) Maps to phase_5 Status

**File:** `app/Models/Rollout/CommunityRollout.php`

**Problem:** `6 => ['status' => self::STATUS_PHASE_5, 'field' => 'phase_6']` — phase 6 uses STATUS_PHASE_5. No STATUS_PHASE_6 constant.

**Impact:** Cosmetic — phase 6 status shows as phase_5_verification. Consider adding STATUS_PHASE_6 if phase 6 is distinct.

---

### 11. ProcessMonthlyRefreshJob: New Businesses Need community_id

**File:** `app/Jobs/Rollout/ProcessMonthlyRefreshJob.php`

**Problem:** When creating new business via `upsertBusiness` + `assignToRegion`, BusinessDiscoveryService does not set community_id. Monthly refresh filters by `Business::where('community_id', $community->id)` for absence detection — new businesses won't have it.

**Fix:** Ensure upsertBusiness sets community_id (see #6).

---

### 12. RolloutController costs() — SQLite Compatibility

**File:** `app/Http/Controllers/Api/V1/RolloutController.php`

**Problem:** `DB::raw('SUM(estimated_cost) as total_cost')` — generally fine. `$costs->sum('total_cost')` — Laravel casts to float. Should work on SQLite. No obvious issue.

---

## LOW — Minor / Style

### 13. Business scopeActive vs scopeActiveForRollout

**File:** `app/Models/Business.php`

**Problem:** `scopeActive()` checks `status = 'active'`. `scopeActiveForRollout()` checks `is_active = true`. Two different concepts. ProcessMonthlyRefreshJob uses `where('is_active', true)` directly — correct.

---

### 14. TASK-01 Migration: communities Table workspace_id, created_by

**File:** `database/migrations/2026_02_16_000001_add_community_id_to_businesses_table.php`

**Problem:** Creates communities with `workspace_id` and `created_by`. Communities table must have these columns. If not, migration fails.

**Verification:** Check communities table schema.

---

### 15. Throttle Config

**File:** `config/news-workflow.php`

**Problem:** Jobs use `config('news-workflow.business_discovery.throttle_ms', 100)`. Config has `radius_km` but no explicit `throttle_ms` in business_discovery. Default 100 used — OK.

---

## Summary Table

| # | Severity | Issue | Fix Effort |
|---|----------|-------|------------|
| 1 | CRITICAL | GooglePlacesService missing searchTextPlaces, searchTextQuery | High |
| 2 | CRITICAL | Config missing dense/sparse/text_search_queries | Low |
| 3 | CRITICAL | evaluateAndSetupNewsSource private + wrong signature | Medium |
| 4 | HIGH | state_code unique blocks re-rollouts | Low |
| 5 | HIGH | Region missing community_id, community() | Low |
| 6 | HIGH | upsertBusiness not setting community_id | Low |
| 7 | HIGH | NewsSource customer_status vs is_potential_customer | Low |
| 8 | HIGH | routeToEvent doesn't create events | Medium |
| 9 | MEDIUM | Phases 2–6 stubs, no website scanning | High |
| 10 | MEDIUM | Phase 6 status constant | Low |
| 11 | MEDIUM | Monthly refresh community_id | Depends on #6 |
| 12–15 | LOW | Various | Low |

---

## Recommended Fix Order

1. **Config** — Add dense_categories, sparse_categories, text_search_queries (unblocks jobs)
2. **GooglePlacesService** — Implement searchTextPlaces, searchTextQuery, getDiscoveryFieldMask
3. **BusinessDiscoveryService** — Fix evaluateAndSetupNewsSource (public overload with CommunityRollout), set community_id in upsertBusiness
4. **Region model** — Add community_id, community()
5. **Migration** — Remove state_code unique (new migration)
6. **ProcessCommunityRolloutJob** — Wire Phase 2 to ProcessWebsiteScanJob / evaluateAndSetupNewsSource
7. **ContentRoutingService** — Implement actual Event creation in routeToEvent

---

## Verification Commands

```bash
# After fixes, verify:
php artisan tinker --execute="
  \$r = app(\App\Services\News\GooglePlacesService::class);
  echo method_exists(\$r, 'searchTextPlaces') ? 'OK' : 'MISSING';
"
php artisan config:clear && php artisan config:cache
php artisan tinker --execute="
  echo count(config('news-workflow.business_discovery.dense_categories', [])) . ' dense';
"
```
