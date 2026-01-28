# Civic Sources Integration for Day.News

This module integrates government civic platforms (CivicPlus, Granicus Legistar, Nixle) into the Day.News newsroom workflow, automatically collecting meeting agendas, legislation, public safety alerts, and government news.

## Overview

| Platform | Type | Content | API Access |
|----------|------|---------|------------|
| **Legistar** | Free REST API | Meetings, agendas, legislation, votes | Public (no key needed for most cities) |
| **CivicPlus** | RSS Feeds | Agendas, alerts, calendar, news | Public (if enabled by municipality) |
| **Nixle** | Scraping + RSS | Police alerts, fire alerts, public safety | Public pages + agency RSS feeds |

## Installation

### 1. Add Service Provider

In `config/app.php`, add:

```php
'providers' => [
    // ...
    App\Providers\CivicSourcesServiceProvider::class,
],
```

### 2. Run Migration

```bash
php artisan migrate
```

This creates:
- `civic_source_platforms` - Platform definitions (seeded with CivicPlus, Legistar, Nixle)
- `civic_sources` - Individual sources (city sites, agency feeds)
- `civic_content_items` - Raw collected content
- `civic_collection_runs` - Collection tracking

### 3. Publish Config (optional)

```bash
php artisan vendor:publish --tag=civic-sources-config
```

### 4. Configure Environment

```env
# Enable/disable civic sources
CIVIC_SOURCES_ENABLED=true

# Platform toggles
CIVIC_LEGISTAR_ENABLED=true
CIVIC_CIVICPLUS_ENABLED=true
CIVIC_NIXLE_ENABLED=true

# Integration with news workflow
CIVIC_INTEGRATE_WORKFLOW=true

# Processing
CIVIC_AUTO_PROCESS_ITEMS=true
CIVIC_MAX_ITEMS_PER_SOURCE=100
```

## Usage

### Command Line

```bash
# List all civic sources
php artisan civic:sources list

# List sources for a specific region
php artisan civic:sources list --region="Tampa"

# Discover sources for a region (auto-detects Legistar, CivicPlus, creates Nixle)
php artisan civic:sources discover --region="Tampa"

# Collect from all sources
php artisan civic:sources collect

# Collect from a specific region
php artisan civic:sources collect --region="Tampa"

# Collect synchronously (not queued)
php artisan civic:sources collect --region="Tampa" --sync

# Add a Legistar source manually
php artisan civic:sources add --platform=legistar --region="Tampa" --client=tampa

# Add a CivicPlus source
php artisan civic:sources add --platform=civicplus --region="Tampa" --url="https://www.tampa.gov"

# Add Nixle coverage
php artisan civic:sources add --platform=nixle --region="Tampa" --zip="33602,33603,33604,33605"

# Test a Legistar client
php artisan civic:sources test --client=tampa

# Test a source
php artisan civic:sources test --source=<uuid>

# Show statistics
php artisan civic:sources stats
php artisan civic:sources stats --region="Tampa"
```

### Programmatic Usage

```php
use App\Services\Civic\CivicSourceCollectionService;
use App\Services\Civic\LegistarService;

// Inject via constructor or resolve from container
$service = app(CivicSourceCollectionService::class);

// Collect from all sources in a region
$results = $service->collectForRegion($region);

// Process pending items into NewsArticles
$processed = $service->processPendingItems($region);

// Discover sources for a new region
$discovered = $service->discoverSourcesForRegion($region);

// Test a Legistar client
$legistar = app(LegistarService::class);
$exists = $legistar->testClient('tampa');
$events = $legistar->fetchEvents($source, daysAhead: 30);
```

### Queue Jobs

```php
use App\Jobs\News\ProcessCivicSourcesJob;
use App\Jobs\News\ProcessSingleCivicSourceJob;

// Process all civic sources for a region
ProcessCivicSourcesJob::dispatch($region);

// Process a single source
ProcessSingleCivicSourceJob::dispatch($source);
```

## Integration with News Workflow

### Option 1: Integrate into Phase 2 (News Collection)

Modify `ProcessPhase2NewsCollectionJob.php`:

```php
use App\Jobs\News\ProcessCivicSourcesJob;

public function handle(): void
{
    // ... existing code ...

    // Add civic sources collection
    if (config('civic-sources.scheduling.integrate_with_news_workflow')) {
        ProcessCivicSourcesJob::dispatch($this->region, processItems: true);
    }

    // ... rest of existing code ...
}
```

### Option 2: Independent Scheduling

In `app/Console/Kernel.php`:

```php
protected function schedule(Schedule $schedule): void
{
    // Collect from civic sources every 2 hours
    $schedule->command('civic:sources collect')
        ->everyTwoHours()
        ->withoutOverlapping()
        ->runInBackground();
}
```

## Content Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    CIVIC PLATFORMS                          │
├─────────────┬─────────────────┬─────────────────────────────┤
│  Legistar   │   CivicPlus     │         Nixle               │
│  (API)      │   (RSS)         │     (Scrape/RSS)            │
└──────┬──────┴────────┬────────┴──────────────┬──────────────┘
       │               │                       │
       ▼               ▼                       ▼
┌─────────────────────────────────────────────────────────────┐
│                 CivicSourceCollectionService                │
│  - Fetches from appropriate platform service                │
│  - Deduplicates content                                     │
│  - Stores in civic_content_items                            │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  civic_content_items                        │
│  - Meetings, agendas, matters, alerts                       │
│  - Status: pending → processed/skipped                      │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│               processPendingItems()                         │
│  - Filters newsworthy items                                 │
│  - Creates NewsArticle records                              │
│  - Links back to civic_content_items                        │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                     news_articles                           │
│  - source_type: civic_legistar, civic_civicplus, civic_nixle│
│  - Flows through normal Phase 3+ workflow                   │
└─────────────────────────────────────────────────────────────┘
```

## Content Types

| Type | Platform | Example | Processing |
|------|----------|---------|------------|
| `meeting` | Legistar | "City Council Meeting - January 21" | Creates news article about upcoming meeting |
| `agenda` | CivicPlus | "Planning Board Agenda" | Creates article with agenda items |
| `matter` | Legistar | "[ORD-2025-01] Zoning Amendment" | Creates article about legislation |
| `alert` | Nixle | "ALERT: Road Closure Main St" | High-priority news article |
| `advisory` | Nixle | "Traffic Advisory: Construction" | Medium-priority article |
| `event` | CivicPlus | "Community Clean-up Day" | Can be extracted as Event |

## Known Legistar Clients

The following cities have confirmed working Legistar API access:

| City | Client Name | Verified |
|------|-------------|----------|
| New York City | `nyc` | ✅ |
| Seattle | `seattle` | ✅ |
| Chicago | `chicago` | ✅ |
| Los Angeles | `losangeles` | ✅ |
| San Francisco | `sanfrancisco` | ✅ |
| Tampa | `tampa` | ✅ |
| Austin | `austin` | ✅ |
| Portland | `portland` | ✅ |
| Boston | `boston` | ✅ |

To discover more: `php artisan civic:sources test --client=yourcity`

## Troubleshooting

### Legistar client not found
```bash
# Try variations
php artisan civic:sources test --client=tampa
php artisan civic:sources test --client=tampafl
php artisan civic:sources test --client=cityoftampa

# Check the public portal URL - client is usually the subdomain
# https://tampa.legistar.com → client is "tampa"
```

### CivicPlus RSS not available
Not all CivicPlus sites have RSS enabled. Check manually:
```
https://www.citysite.gov/rss.aspx
```

If you get a 404, RSS is not enabled for that site.

### Nixle shows no alerts
- Verify the ZIP codes are correct
- Some areas have no Nixle-participating agencies
- Try nearby ZIP codes

### Source health degraded
Sources are automatically disabled after 10 consecutive failures. To re-enable:
```php
$source->update([
    'is_enabled' => true,
    'consecutive_failures' => 0,
    'health_score' => 100,
]);
```

## File Structure

```
app/
├── Console/Commands/
│   └── ManageCivicSources.php       # Artisan command
├── Jobs/News/
│   ├── ProcessCivicSourcesJob.php   # Region collection job
│   └── ProcessSingleCivicSourceJob.php # Single source job
├── Models/
│   ├── CivicSourcePlatform.php      # Platform definitions
│   ├── CivicSource.php              # Individual sources
│   ├── CivicContentItem.php         # Collected content
│   └── CivicCollectionRun.php       # Collection tracking
├── Providers/
│   └── CivicSourcesServiceProvider.php
└── Services/Civic/
    ├── CivicSourceCollectionService.php # Main orchestrator
    ├── LegistarService.php          # Legistar API
    ├── CivicPlusService.php         # CivicPlus RSS
    └── NixleService.php             # Nixle scraping

config/
└── civic-sources.php

database/migrations/
└── 2025_01_21_000001_create_civic_sources_tables.php
```

## API Reference

### LegistarService

```php
// Fetch upcoming meetings
$events = $legistar->fetchEvents($source, daysAhead: 30);

// Fetch recent legislation
$matters = $legistar->fetchMatters($source, daysBack: 14);

// Test if client exists
$exists = $legistar->testClient('tampa');

// Discover client name
$client = $legistar->discoverClient('Tampa', 'FL');
```

### CivicPlusService

```php
// Discover RSS feeds
$feeds = $civicPlus->discoverFeeds('https://www.tampa.gov');

// Fetch from feed
$items = $civicPlus->fetchFeed($feedUrl, 'agenda');

// Detect CivicPlus site
$isCivicPlus = $civicPlus->detectCivicPlus('https://www.citysite.gov');
```

### NixleService

```php
// Fetch alerts by ZIP
$alerts = $nixle->fetchAlertsByZipCode('33602');

// Fetch from agency RSS
$alerts = $nixle->fetchAlertsFromRss($agencyId);

// Discover agencies
$agencies = $nixle->discoverAgencies('33602');
```

## Performance Considerations

- **Rate Limiting**: Built-in timeouts prevent overwhelming APIs
- **Deduplication**: Content hash prevents duplicate storage
- **Health Tracking**: Unhealthy sources are automatically disabled
- **Parallel Processing**: Each source runs as a separate queue job
- **Incremental Collection**: Only new content is stored

## License

Part of the Day.News platform by Fibonacco Publishing.
