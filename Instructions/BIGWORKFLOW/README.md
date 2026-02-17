# Fibonacco State Rollout & Content Pipeline — Cursor Task Package

## Execution Instructions

Feed these task files to Cursor **one at a time, in order**. Each task is self-contained — Cursor never needs to reference another task file. Complete each task's verification step before moving to the next.

**Day.News is a NATIONAL publication. Never hardcode state names or affiliate with any geographic region.**

## Task Sequence

| File | Priority | Description | Est. Effort | Depends On |
|------|----------|-------------|-------------|------------|
| `TASK-01-P0-community-id-on-business.md` | P0 | Add `community_id` to Business + migration + backfill | 2hr | None |
| `TASK-02-P1-state-rollout-tables.md` | P1 | Create `state_rollouts`, `community_rollouts`, `rollout_api_usage` tables | 3hr | None |
| `TASK-03-P2-expand-category-list.md` | P2 | Expand Google Places categories from 31 → 87 | 1hr | None |
| `TASK-04-P3-text-search-pagination.md` | P3 | Add Text Search (New) with pagination to GooglePlacesService | 4hr | TASK-03 |
| `TASK-05-P4-essentials-field-mask.md` | P4 | Switch to Essentials-only field mask (two-pass strategy) | 3hr | TASK-04 |
| `TASK-06-P5-rollout-orchestrator.md` | P5 | Create StateRolloutOrchestratorService + CommunityRolloutService + jobs | 8hr | TASK-01, TASK-02, TASK-05 |
| `TASK-07-P6-website-scanner.md` | P6 | Create WebsiteScannerService (RSS, sitemap, platform detection) | 8hr | TASK-06 |
| `TASK-08-P7-news-source-setup.md` | P7 | Add `evaluateAndSetupNewsSource()` to BusinessDiscoveryService | 6hr | TASK-07 |
| `TASK-09-P8-content-routing-bridge.md` | P8 | Create ContentRoutingService (Pipeline B → Pipeline A bridge) | 6hr | TASK-08 |
| `TASK-10-P9-story-tracking.md` | P9 | Create story_tracking tables + StoryTrackingService | 6hr | TASK-09 |
| `TASK-11-P10-reporter-outreach.md` | P10 | Create community_leaders/quote_requests + ReporterOutreachService | 8hr | TASK-10 |
| `TASK-12-P11-wire-service.md` | P11 | Create wire_service tables + WireServiceCollectionService | 6hr | TASK-09 |
| `TASK-13-P12-scheduled-jobs.md` | P12 | Set up all scheduled jobs in `routes/console.php` | 2hr | TASK-01–TASK-12 |
| `TASK-14-P13-rollout-controller-api.md` | P13 | Create RolloutController + API endpoints for monitoring | 4hr | TASK-06 |
| `TASK-15-P14-monthly-refresh-dedup.md` | P14 | Monthly refresh job + dedup logic | 4hr | TASK-05, TASK-06 |

## Critical Architectural Decisions (Already Made — Do Not Revisit)

1. **Classification = Routing, Not Rejection.** Everything has value.
2. **Multi-Output Support.** One RawContent → Article + Event + Announcement simultaneously.
3. **Bridge Pattern.** Follow `CivicSourceCollectionService.createNewsArticleFromItem()` pattern.
4. **Two-Pass API Strategy.** Essentials ($5/1K) for bulk, Pro ($20/1K) for enrichment.
5. **Text Search for Dense, Nearby for Sparse.** 16 dense categories use Text Search with pagination.
6. **Photos On-Demand Only.** Store references, fetch binary only when displayed.
7. **Cross-Database Writes Need Error Handling.** Publishing DB, Command Center DB, AI Tools DB are separate PostgreSQL instances.
8. **Day.News is NATIONAL.** Never hardcode state names.

## Cross-Database Architecture

| Cluster | Railway Service | DB Connection Name |
|---------|----------------|--------------------|
| Publishing DB | Postgres Publishing | `publishing` (default) |
| Command Center DB | Postgres CC CRM SMB | `command_center` |
| AI Tools DB | Postgres - AI TOOLs | `ai_tools` |

No cross-database transactions. Each cross-DB write needs independent error handling.

## Non-Negotiable: TASK-01 through TASK-09 must be completed before any community can be properly rolled out.
