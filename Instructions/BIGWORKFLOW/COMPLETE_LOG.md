# BIGWORKFLOW — Complete Log

## Summary
- **Started:** 2026-02-16
- **Total Tasks:** 15
- **Completed:** 15
- **Incomplete:** 0

---

## Task Log

### TASK-01: Add community_id to Business
- **Migration:** `database/migrations/2026_02_16_000001_add_community_id_to_businesses_table.php`
- **Models:** Business (community, newsSource, scopeInCommunity), Region (community), Community (regions, state, state_code)
- **Service:** BusinessDiscoveryService::upsertBusiness() sets community_id
- **Backfill:** SQLite-compatible loop over business_region → region → community

### TASK-02: State rollout tables
- **Migration:** `database/migrations/2026_02_16_000002_create_state_rollout_tables.php`
- **Models:** StateRollout, CommunityRollout, RolloutApiUsage

### TASK-03: Expand Google Places categories
- **Config:** `config/news-workflow.php` — dense_categories (16), sparse_categories (74), text_search_queries (12), categories (90)

### TASK-04: Text Search with pagination
- **Service:** GooglePlacesService — searchTextPlaces(), searchTextQuery(), getDiscoveryFieldMask(), routing in discoverBusinessesForCategory()

### TASK-05: Essentials-only field mask
- **Service:** GooglePlacesService — getDiscoveryFieldMask() (9 Essentials fields), searchNearbyPlaces(), parseBusinessData(), enrichBusinessDetails(), fetchPhotoByReference()

### TASK-06: StateRolloutOrchestratorService + ProcessCommunityRolloutJob
- **Service:** `app/Services/Rollout/StateRolloutOrchestratorService.php`
- **Job:** `app/Jobs/Rollout/ProcessCommunityRolloutJob.php` — 6 phases

### TASK-07: WebsiteScannerService
- **Service:** `app/Services/Newsroom/WebsiteScannerService.php`
- **Job:** `app/Jobs/Rollout/ProcessWebsiteScanJob.php`

### TASK-08: evaluateAndSetupNewsSource
- **Service:** BusinessDiscoveryService::evaluateAndSetupNewsSource(), discoverAndEvaluate()
- **Model:** Business::newsSource()
- **Job:** ProcessCommunityRolloutJob calls evaluateAndSetupNewsSource() after discovery

### TASK-09: ContentRoutingService (Pipeline B → A bridge)
- **Service:** `app/Services/Newsroom/ContentRoutingService.php`
- **Job:** `app/Jobs/Newsroom/ProcessClassifiedContentJob.php`

### TASK-10: Story tracking
- **Migration:** `database/migrations/2026_02_16_000003_create_story_follow_ups_table.php`
- **Model:** StoryFollowUp
- **Service:** `app/Services/News/StoryTrackingService.php`

### TASK-11: Reporter outreach
- **Migration:** `database/migrations/2026_02_16_000004_create_reporter_outreach_tables.php`
- **Models:** CommunityLeader, QuoteRequest
- **Service:** `app/Services/News/ReporterOutreachService.php`

### TASK-12: Wire service
- **Migration:** `database/migrations/2026_02_16_000005_create_wire_service_tables.php`
- **Service:** `app/Services/Newsroom/WireServiceCollectionService.php`
- **Seeder:** `database/seeders/WireServiceFeedSeeder.php`

### TASK-13: Scheduled jobs
- **File:** `routes/console.php` — Story tracking (daily 04:00), source health check (weekly Sunday 03:00)
- **Fix:** Added `name()` before `withoutOverlapping()` for all scheduled events (Laravel requirement)

### TASK-14: RolloutController + API endpoints
- **Controller:** `app/Http/Controllers/Api/V1/RolloutController.php`
- **Routes:** `routes/api/v1/rollouts.php` — GET /, GET /costs, POST /, GET /{stateCode}, GET /{stateCode}/communities/{communityId}, PATCH /{id}/pause, PATCH /{id}/resume
- **Registration:** `routes/api/v1.php` — Rollout routes under authenticated group

### TASK-15: Monthly refresh job + dedup logic
- **Migration:** `database/migrations/2026_02_16_000006_add_refresh_tracking_to_businesses.php` — last_refreshed_at, consecutive_absences, is_active
- **Job:** `app/Jobs/Rollout/ProcessMonthlyRefreshJob.php` — staggered batches (33/day), Text Search per dense category, 3-absence deactivation
- **Model:** Business — fillable, casts, scopeActiveForRollout()
- **Schedule:** `routes/console.php` — monthly on 1st at 02:00 UTC

---

## Code Review Fixes (2026-02-16)

1. **Config** — Added dense_categories (16), sparse_categories (74), text_search_queries (12), throttle_ms
2. **GooglePlacesService** — searchTextPlaces(), searchTextQuery(), getDiscoveryFieldMask(); discoverBusinessesForCategory routes dense→Text Search, sparse→Nearby
3. **BusinessDiscoveryService** — evaluateAndSetupNewsSource() public with CommunityRollout; upsertBusiness sets community_id; assignToRegion($business, $region, ?$cr)
4. **Region model** — community_id in fillable, community() relationship
5. **Migration 2026_02_16_000007** — Removed state_code unique from state_rollouts (allows re-rollouts)
6. **ProcessCommunityRolloutJob** — Passes $cr to assignToRegion; ProcessWebsiteScanJob dispatched for businesses with websites
7. **ContentRoutingService** — routeToEvent() creates Event records, attaches region, updates raw.event_id
