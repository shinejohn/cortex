# TASK-13-P12: Set Up All Scheduled Jobs in routes/console.php

## Context

All the services and jobs from TASK-01 through TASK-12 need to be wired into Laravel's scheduler. Order matters — some jobs depend on others completing first. The daily news workflow already runs at 6:00 AM UTC. New jobs must NOT collide with it.

**Depends on:** TASK-01 through TASK-12 (all services and jobs must exist).

---

## Objective

Add all new scheduled jobs to `routes/console.php` with proper timing, queues, and descriptions.

---

## Files to Modify

### MODIFY: routes/console.php

**Add these schedule entries. Preserve any existing entries — add these BELOW them:**

```php
use Illuminate\Support\Facades\Schedule;
use App\Jobs\Newsroom\ProcessClassifiedContentJob;
use App\Services\Newsroom\WireServiceCollectionService;
use App\Services\News\StoryTrackingService;

// ============================================================
// EXISTING: Daily News Workflow (runs at 6:00 AM UTC)
// Do NOT modify or move this. All new jobs are scheduled to
// avoid colliding with this window (6:00-8:00 AM UTC).
// ============================================================

// ============================================================
// NEW: Content Pipeline & Rollout Jobs
// ============================================================

// --- Every 15 Minutes ---

// Process classified content from Pipeline B → Pipeline A
// This is the critical bridge that turns RawContent into NewsArticle records.
Schedule::job(new ProcessClassifiedContentJob())
    ->everyFifteenMinutes()
    ->withoutOverlapping()
    ->onQueue('routing')
    ->description('Route classified Pipeline B content to Pipeline A');

// --- Every 30 Minutes ---

// Poll wire service RSS feeds for new press releases
Schedule::call(function () {
    app(WireServiceCollectionService::class)->pollAllFeeds();
})
    ->everyThirtyMinutes()
    ->withoutOverlapping()
    ->description('Poll wire service feeds (PR Newswire, Business Wire, GlobeNewswire)');

// --- Hourly ---

// Process Pipeline B source collection (RSS feeds, web scraping)
// This collects content from all active NewsSource → CollectionMethod records.
// NOTE: If a ProcessSourceCollectionJob already exists, use that instead.
// Schedule::job(new ProcessSourceCollectionJob())
//     ->hourly()
//     ->withoutOverlapping()
//     ->onQueue('collection')
//     ->description('Collect content from active RSS and scrape sources');

// --- Daily ---

// Story thread check-ins (run at 4:00 AM UTC, before daily workflow)
Schedule::call(function () {
    $count = app(StoryTrackingService::class)->processScheduledChecks();
    \Illuminate\Support\Facades\Log::info("Story tracking: {$count} threads checked");
})
    ->dailyAt('04:00')
    ->withoutOverlapping()
    ->description('Check active story threads for follow-up opportunities');

// --- Weekly ---

// Source health check (Sunday at 3:00 AM UTC)
// Checks which NewsSource records are producing content.
// Flags unhealthy sources. Auto-disables after 10 consecutive failures.
Schedule::call(function () {
    $sources = \App\Models\NewsSource::where('is_active', true)
        ->where('consecutive_failures', '>=', 10)
        ->get();

    foreach ($sources as $source) {
        $source->update(['is_active' => false]);
        \Illuminate\Support\Facades\Log::info("Auto-disabled unhealthy source: {$source->name}");
    }
})
    ->weeklyOn(0, '03:00') // Sunday 3:00 AM
    ->description('Disable unhealthy news sources with 10+ consecutive failures');

// --- Monthly ---

// Monthly business refresh (1st of month at 2:00 AM UTC)
// Re-discovers businesses to find new ones and detect changes.
// Implemented in TASK-15.
// Schedule::job(new ProcessMonthlyRefreshJob())
//     ->monthlyOn(1, '02:00')
//     ->withoutOverlapping()
//     ->onQueue('refresh')
//     ->description('Monthly business discovery refresh for all active communities');
```

---

## Implementation Steps

1. Open `routes/console.php`.
2. Add the `use` imports at the top.
3. Add all schedule entries BELOW any existing ones.
4. Keep commented-out entries for jobs that will be created in later tasks (TASK-15).

---

## Verification

```bash
# List all scheduled tasks
php artisan schedule:list

# Expected output should include:
# - ProcessClassifiedContentJob (every 15 min)
# - Wire service polling (every 30 min)
# - Story tracking check (daily at 4:00)
# - Source health check (weekly Sunday 3:00)
```

**Expected:** All new scheduled jobs appear in the list with correct timing. No conflicts with the 6:00 AM daily news workflow.
