# Event Collection System — Concrete Implementation Plan

**Version:** 1.0  
**Date:** February 2025  
**Status:** Ready for Implementation

---

## Executive Summary

This plan extends the news workflow to:
1. **Detect event calendar systems** embedded within websites (Eventbrite, Meetup, The Events Calendar, etc.)
2. **Collect events directly** from calendars, iCal feeds, and schema.org markup
3. **Deduplicate events** robustly before insertion
4. **Unify news + event collection** so a single source fetch can yield both content types

---

## Part 1: Event Platform / Calendar Detection

### 1.1 Event Systems to Detect

| Platform / Tool | Detection Signatures | Collection Method |
|-----------------|---------------------|-------------------|
| **Eventbrite** (embed or direct) | `eventbrite.com`, `eventbrite-s3`, `ebstatic.com`, `eventbrite` in HTML | API or scrape |
| **Meetup** | `meetup.com`, `meetup.nyc3.cdn`, `meetup` in HTML | API or scrape |
| **The Events Calendar** (WordPress) | `tribe-events`, `tribe_events`, `the-events-calendar` | Scrape + schema.org |
| **All-in-One Event Calendar** | `ai1ec-`, `ai1ec_event` | Scrape |
| **Events Manager** (WordPress) | `em-item`, `events-manager` | Scrape |
| **EventON** | `eventon`, `evo_event` | Scrape |
| **Full Calendar** (JS) | `fullcalendar`, `fc-event` | Scrape (needs JS) |
| **Google Calendar embed** | `calendar.google.com`, `embed` | iCal export if available |
| **Facebook Events** | `facebook.com/events`, `fb.com/events` | Scrape (limited) |
| **Schema.org Event** | `"@type":"Event"` in JSON-LD | Parse from any page |
| **iCal feed** | `\.ics`, `calendar\.ics`, `feed\.ics` | Direct parse |

### 1.2 New Service: `EventPlatformDetectorService`

**File:** `app/Services/Newsroom/EventPlatformDetectorService.php`

**Purpose:** Scan a website's HTML (and optionally linked pages) to detect embedded event systems.

**Methods:**
```php
// Scan a single URL's HTML for event platform signatures
public function detectFromHtml(string $url, string $html): array
// Returns: ['platforms' => ['eventbrite', 'tribe_events'], 'event_urls' => [...], 'ical_urls' => [...]]

// Scan a page and discover linked event/calendar URLs
public function discoverEventUrls(string $baseUrl, string $html): array
// Returns: ['/events', '/calendar', '/upcoming-events', ...]

// Check if HTML contains schema.org Event JSON-LD
public function hasSchemaOrgEvents(string $html): bool

// Extract iCal URLs from page (link rel, href .ics)
public function extractIcalUrls(string $url, string $html): array
```

**Detection Logic (signatures to check in HTML):**
```php
private const EVENT_SIGNATURES = [
    'eventbrite' => ['eventbrite.com', 'eventbrite-s3', 'ebstatic.com', 'eventbrite'],
    'meetup' => ['meetup.com', 'meetup.nyc3', 'meetup'],
    'tribe_events' => ['tribe-events', 'tribe_events', 'the-events-calendar'],
    'ai1ec' => ['ai1ec-', 'ai1ec_event', 'all-in-one-event-calendar'],
    'events_manager' => ['em-item', 'events-manager', 'em_event'],
    'eventon' => ['eventon', 'evo_event'],
    'fullcalendar' => ['fullcalendar', 'fc-event'],
    'google_calendar' => ['calendar.google.com', 'calendar.google.com/calendar/embed'],
    'facebook_events' => ['facebook.com/events', 'fb.com/events'],
    'schema_event' => ['"@type":"Event"', '"@type": "Event"'],
];
```

### 1.3 Integration with PlatformDetectorService

**Modify:** `app/Services/Newsroom/PlatformDetectorService.php`

- Add a new method `detectEventPlatforms(string $url, string $html): array` that delegates to `EventPlatformDetectorService` or runs event-specific matching.
- When `matchPlatform()` returns a CMS (e.g. WordPress), also run event platform detection to see if The Events Calendar, etc. is present.

**Modify:** `app/Services/Newsroom/AdaptiveFetcherService.php` (or equivalent)

- After fetching HTML, call event platform detection.
- If event platforms found, create/update `CollectionMethod` with `method_type = event_calendar` and store `event_platform_slugs` in `platform_config`.

### 1.4 PlatformProfile Additions

**Modify:** `database/seeders/PlatformProfileSeeder.php`

Add event calendar platform profiles:
- `the_events_calendar` (tribe-events)
- `ai1ec` (All-in-One Event Calendar)
- `events_manager`
- `eventon`
- `meetup` (for Meetup group pages)
- `fullcalendar`

---

## Part 2: Event Deduplication

### 2.1 Deduplication Strategy

Events can arrive from:
- Direct collection (iCal, schema.org, scrape)
- AI extraction from news articles
- Civic content (meetings)

**Deduplication keys (in order of reliability):**

| Priority | Key | Use Case |
|----------|-----|----------|
| 1 | `source_url` (canonical event URL) | Same URL = same event |
| 2 | `external_id` (Eventbrite ID, Meetup ID, etc.) | Platform-specific ID |
| 3 | Composite: `(normalized_title, event_date, venue_id)` | Fuzzy match |
| 4 | Composite: `(normalized_title, event_date, venue_name_normalized)` | When venue not matched yet |
| 5 | Content hash of `(title + date + venue + url)` | Fallback |

### 2.2 New Migration: Event Deduplication Fields

**File:** `database/migrations/YYYY_MM_DD_add_event_deduplication_fields.php`

```php
Schema::table('events', function (Blueprint $table) {
    $table->string('source_url', 2048)->nullable()->after('source_type');
    $table->string('external_id', 255)->nullable()->after('source_url');
    $table->string('content_hash', 64)->nullable()->after('external_id');
});
$table->index('external_id');
$table->index('content_hash');
// Note: source_url may be too long for index on MySQL (767 byte limit). Prefer content_hash for lookups.
```

### 2.3 New Service: `EventDeduplicationService`

**File:** `app/Services/News/EventDeduplicationService.php`

**Methods:**
```php
// Generate content hash for an event
public function generateContentHash(array $eventData): string

// Check if event already exists (returns existing Event or null)
public function findDuplicate(array $eventData, ?string $regionId = null): ?Event

// Normalize title for fuzzy matching (lowercase, trim, remove extra spaces)
public function normalizeTitle(string $title): string

// Normalize venue name for fuzzy matching
public function normalizeVenueName(?string $name): string
```

**`findDuplicate()` logic:**
1. If `source_url` provided and non-empty: `Event::where('source_url', $url)->first()`
2. If `external_id` provided: `Event::where('external_id', $extId)->first()`
3. If `content_hash` provided: `Event::where('content_hash', $hash)->first()`
4. Fuzzy: same region, same date (day), normalized title match, venue match (or venue name similarity)
5. Use configurable similarity threshold (e.g. 85% title match)

### 2.4 Integration Points for Deduplication

**Before creating Event:**
- `EventPublishingService::publishDraft()` — check duplicate before create
- `EventCollectionService::createEventFromDirectSource()` (new) — check duplicate before create
- Any iCal/schema.org parser — check duplicate before create

**Flow:**
```php
$duplicate = $this->eventDeduplication->findDuplicate($eventData, $regionId);
if ($duplicate) {
    Log::info('Event duplicate skipped', ['existing_id' => $duplicate->id, 'title' => $eventData['title']]);
    return null; // or return existing for idempotency
}
```

---

## Part 3: Event Collection Pipeline

### 3.1 New Model: `RawEvent` (Optional)

**File:** `app/Models/RawEvent.php`  
**Migration:** `create_raw_events_table`

Stores scraped/parsed event data before validation and deduplication. Useful for debugging and reprocessing.

```php
// Columns: id, source_id, collection_method_id, region_id, external_id, source_url,
// title, event_date, time, venue_name, venue_address, description, url, raw_data,
// content_hash, processing_status (pending|validated|rejected|published), created_at, updated_at
```

*Alternative:* Skip RawEvent and go straight to Event with `status=draft` if deduplication passes. RawEvent adds flexibility for manual review.

### 3.2 New Service: `EventCollectionService`

**File:** `app/Services/News/EventCollectionService.php`

**Purpose:** Collect events from direct sources (iCal, schema.org, event platform scrapes).

**Methods:**
```php
// Parse iCal URL and return event data array
public function fetchFromIcal(string $icalUrl, string $regionId): array

// Extract schema.org Event from HTML
public function extractSchemaOrgEvents(string $html, string $pageUrl): array

// Process a CollectionMethod that has event content
public function collectFromMethod(CollectionMethod $method): array

// Create Event from validated event data (with deduplication)
public function createEvent(array $data, Region $region, ?string $sourceType = null): ?Event
```

### 3.3 New Collection Method Type: `ical`

**Modify:** `app/Models/CollectionMethod.php`

```php
public const TYPE_ICAL = 'ical';
```

**Modify:** `app/Services/Newsroom/AdaptiveFetcherService.php` (or create `EventFetcherService`)

- When `method_type === TYPE_ICAL`, fetch URL, parse as iCal, return event items.
- Use a library like `spatie/icalendar-generator` or `eluceo/ical` for parsing.

### 3.4 Schema.org Event Parser

**File:** `app/Services/News/SchemaOrgEventParser.php`

**Purpose:** Extract `@type: Event` from JSON-LD in HTML.

```php
public function parse(string $html): array
// Returns array of event data: [['title' => ..., 'startDate' => ..., 'location' => ...], ...]
```

---

## Part 4: Source Scan Enhancement

### 4.1 Event Source Scan During Discovery

**Modify:** `app/Services/News/BusinessDiscoveryService.php` (or equivalent discovery service)

When discovering a business/source:
1. Fetch the website URL.
2. Run `PlatformDetectorService::detect()` (existing).
3. Run `EventPlatformDetectorService::detectFromHtml()` (new).
4. If event platforms detected:
   - Set `content_types` to include `events` on the source.
   - Create `CollectionMethod` with `method_type = event_calendar` or `ical` if iCal URL found.
5. Call `discoverEventUrls()` to find `/events`, `/calendar` paths.
6. Optionally fetch those paths and check for schema.org or event markup.
7. Store discovered event URLs in `CollectionMethod.platform_config['event_paths']`.

### 4.2 New Command: `ScanSourceForEvents`

**File:** `app/Console/Commands/Newsroom/ScanSourceForEventsCommand.php`

```bash
php artisan newsroom:scan-events {--source=} {--url=} {--all}
```

- `--source=<id>`: Scan a specific NewsSource by ID.
- `--url=<url>`: Scan a single URL (for testing).
- `--all`: Scan all active sources that have a website_url.

**Behavior:**
1. Fetch the source URL.
2. Run event platform detection.
3. Discover event/calendar subpaths.
4. Create or update CollectionMethods for event collection.
5. Output report: platforms found, event URLs discovered, collection methods created.

---

## Part 5: Unified Collection Flow

### 5.1 Dual Extraction in ProcessDirectSourceCollectionJob

**Modify:** `app/Jobs/News/ProcessDirectSourceCollectionJob.php`

After `AdaptiveFetcherService::fetch()` returns:
1. For each `RawContent` item, bridge to `NewsArticle` (existing).
2. **New:** Run `SchemaOrgEventParser::parse()` on `source_html` (if available).
3. **New:** If event platforms detected on the source, run event extraction (schema.org, or platform-specific selectors).
4. **New:** For each extracted event, call `EventCollectionService::createEvent()` (which runs deduplication).

### 5.2 New Job: `ProcessEventCalendarCollectionJob`

**File:** `app/Jobs/News/ProcessEventCalendarCollectionJob.php`

- Dispatched for sources with `content_types` including `events` and a `CollectionMethod` of type `event_calendar` or `ical`.
- Calls `EventCollectionService::collectFromMethod()`.
- Creates Events via `EventCollectionService::createEvent()` (with deduplication).

### 5.3 Phase 2 Integration

**Modify:** `app/Jobs/News/ProcessPhase2NewsCollectionJob.php`

- Add dispatch of `ProcessEventCalendarCollectionJob` for each region (or per source with event methods).
- Ensure job counter includes event collection jobs so Phase 3 triggers correctly.

---

## Part 6: Data Model Changes Summary

| Change | Type | Description |
|--------|------|-------------|
| `events.source_url` | Migration | Canonical event URL for deduplication |
| `events.external_id` | Migration | Platform-specific ID (Eventbrite ID, etc.) |
| `events.content_hash` | Migration | Hash for deduplication |
| `news_sources.content_types` | Migration | JSON: `['news']` or `['events']` or `['news','events']` |
| `collection_methods.method_type` | Existing | Add `TYPE_ICAL = 'ical'` |
| `collection_methods.platform_config` | Existing | Store `event_platform_slugs`, `event_paths`, `ical_url` |

---

## Part 7: Implementation Order

### Phase A: Deduplication (Foundation)
1. Migration: add `source_url`, `external_id`, `content_hash` to events.
2. Create `EventDeduplicationService`.
3. Integrate deduplication into `EventPublishingService::publishDraft()`.
4. Add tests for deduplication logic.

### Phase B: Event Platform Detection
1. Create `EventPlatformDetectorService`.
2. Add event platform profiles to `PlatformProfileSeeder`.
3. Extend `PlatformDetectorService` with event detection (or integrate EventPlatformDetectorService).
4. Create `ScanSourceForEventsCommand`.

### Phase C: Schema.org & iCal
1. Create `SchemaOrgEventParser`.
2. Add `TYPE_ICAL` to CollectionMethod.
3. Create iCal fetcher/parser in `EventCollectionService`.
4. Integrate schema.org extraction into `ProcessDirectSourceCollectionJob` (dual extraction).

### Phase D: Event Collection Service
1. Create `EventCollectionService` with `createEvent()` (uses deduplication).
2. Create `ProcessEventCalendarCollectionJob`.
3. Wire into Phase 2.

### Phase E: Discovery Integration
1. Add `content_types` to NewsSource (migration).
2. Modify `BusinessDiscoveryService` to run event scan during discovery.
3. Create CollectionMethods for event collection when platforms detected.

---

## Part 8: Configuration

**Add to `config/news-workflow.php`:**

```php
'event_collection' => [
    'enabled' => env('NEWS_WORKFLOW_EVENT_COLLECTION_ENABLED', true),
    'deduplication' => [
        'title_similarity_threshold' => 85,  // percent
        'require_venue_match' => false,       // if true, must match venue
        'date_tolerance_days' => 0,           // same day only
    ],
    'max_events_per_source_per_run' => 50,
    'platforms_enabled' => ['eventbrite', 'meetup', 'tribe_events', 'ai1ec', 'schema_org', 'ical'],
],
```

---

## Part 9: Testing Checklist

- [ ] EventDeduplicationService: same source_url returns existing event
- [ ] EventDeduplicationService: same external_id returns existing event
- [ ] EventDeduplicationService: similar title + date + venue dedupes
- [ ] EventPlatformDetectorService: detects Eventbrite embed in HTML
- [ ] EventPlatformDetectorService: detects The Events Calendar in WordPress
- [ ] SchemaOrgEventParser: extracts Event from JSON-LD
- [ ] EventCollectionService: parses iCal and creates events
- [ ] ProcessEventCalendarCollectionJob: runs without error
- [ ] ScanSourceForEventsCommand: creates collection methods for event sources
- [ ] Full flow: discover → scan → collect → dedupe → no duplicates in DB

---

## Part 10: Files to Create / Modify

### New Files
- `app/Services/Newsroom/EventPlatformDetectorService.php`
- `app/Services/News/EventDeduplicationService.php`
- `app/Services/News/EventCollectionService.php`
- `app/Services/News/SchemaOrgEventParser.php`
- `app/Console/Commands/Newsroom/ScanSourceForEventsCommand.php`
- `app/Jobs/News/ProcessEventCalendarCollectionJob.php`
- `database/migrations/YYYY_MM_DD_add_event_deduplication_fields.php`
- `database/migrations/YYYY_MM_DD_add_content_types_to_news_sources.php`
- `tests/Feature/Services/EventDeduplicationServiceTest.php`
- `tests/Feature/Services/EventPlatformDetectorServiceTest.php`

### Modified Files
- `app/Models/Event.php` — add fillable for source_url, external_id, content_hash
- `app/Models/CollectionMethod.php` — add TYPE_ICAL
- `app/Models/NewsSource.php` — add content_types (migration + fillable)
- `app/Services/News/EventPublishingService.php` — call EventDeduplicationService before create
- `app/Services/Newsroom/PlatformDetectorService.php` — optional event detection hook
- `app/Services/News/BusinessDiscoveryService.php` — run event scan during discovery
- `app/Jobs/News/ProcessDirectSourceCollectionJob.php` — dual extraction (schema.org events)
- `app/Jobs/News/ProcessPhase2NewsCollectionJob.php` — dispatch event collection jobs
- `database/seeders/PlatformProfileSeeder.php` — add event platform profiles
- `config/news-workflow.php` — add event_collection config

---

## Appendix: Event Platform HTML Signatures (Reference)

```
Eventbrite:     eventbrite.com | ebstatic.com | eventbrite-s3
Meetup:         meetup.com | meetup.nyc3.cdn
Tribe Events:   tribe-events | tribe_events | the-events-calendar
AI1EC:          ai1ec- | ai1ec_event
Events Manager: em-item | events-manager
EventON:        eventon | evo_event
FullCalendar:   fullcalendar | fc-event
Google Cal:     calendar.google.com
Schema.org:     "@type":"Event" in application/ld+json
iCal:           .ics in link href
```
