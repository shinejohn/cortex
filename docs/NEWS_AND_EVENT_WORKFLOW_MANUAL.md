# News and Event Workflow — Complete Manual

**Version:** 1.0  
**Last Updated:** February 2025

This manual describes in complete detail the news source roll-out, event source roll-out, news and event identification and capture, article creation, follow-up pieces, event creation and deduplication, and how each page/source type is handled by the codebase.

---

## Table of Contents

1. [Overview](#1-overview)
2. [News Source Roll-Out](#2-news-source-roll-out)
3. [Event Source Roll-Out](#3-event-source-roll-out)
4. [Source Types and Page Handling](#4-source-types-and-page-handling)
5. [News Collection and Identification](#5-news-collection-and-identification)
6. [Event Collection and Identification](#6-event-collection-and-identification)
7. [Article Creation Pipeline (Phases 3–7)](#7-article-creation-pipeline-phases-37)
8. [Event Creation and Deduplication](#8-event-creation-and-deduplication)
9. [Follow-Up and Story Threads](#9-follow-up-and-story-threads)
10. [Commands and Entry Points](#10-commands-and-entry-points)

---

## 1. Overview

The system has two main pipelines that run in parallel:

1. **News Pipeline**: Discovers sources → Collects content → Shortlists → Fact-checks → Selects → Generates articles → Publishes
2. **Event Pipeline**: Discovers event sources → Collects events → Extracts from articles → Deduplicates → Publishes to `events` table

Both pipelines are region-scoped. A region (city, county, etc.) has sources, and content is collected per region.

### Key Models

| Model | Purpose |
|-------|---------|
| `NewsSource` | A publisher or organization that produces news (website, RSS, etc.) |
| `CollectionMethod` | How we collect from a source (RSS, scrape, ical, event_calendar, etc.) |
| `CivicSource` | Government/civic platform (Legistar, CivicPlus, Nixle) — separate from NewsSource |
| `RawContent` | Raw scraped/fetched content before bridging to NewsArticle |
| `NewsArticle` | Processed article candidate entering Phases 3–7 |
| `NewsArticleDraft` | Article in workflow (shortlisted, outline, selected, etc.) |
| `DayNewsPost` | Final published article |
| `Event` | Published event (from extraction or direct collection) |
| `EventExtractionDraft` | Event extracted from article, before publishing |

---

## 2. News Source Roll-Out

### 2.1 Business Discovery (Phase 1)

**When:** Typically monthly (configurable)  
**Command:** `php artisan news:run-business-discovery`  
**Service:** `BusinessDiscoveryService`

**Flow:**

1. For each active region, fetch businesses from **Google Places API** using configured categories (e.g., `night_club`, `museum`, `library`, `city_hall`, `community_center`).
2. For each business returned:
   - **Upsert** `Business` by `google_place_id`
   - **Assign** business to region via `business_region` pivot
   - **Evaluate** if business should be a news source

**News Source Creation (evaluateAndSetupNewsSource):**

A business becomes a `NewsSource` only if:

- It has a `website`
- Its `primary_type` or `categories` include newsy types: `government`, `school`, `university`, `museum`, `library`, `police`, `fire_station`, `local_government_office`, `newspaper`, `news_media`

If both conditions hold:

1. Create `NewsSource` with `source_type = 'organization_site'`, `website_url`, `region_id`, `community_id`
2. **Event scan** (if enabled): Fetch website HTML, run `EventPlatformDetectorService::detectFromHtml()`, create `event_calendar` and `ical` collection methods if event platforms found
3. If no RSS/scrape method exists: Create `CollectionMethod` with `method_type = 'scrape'`, `endpoint_url = website`, `requires_javascript = true`, generic selectors for `article`, `.news-item`, `.post`

**Configuration:** `config/news-workflow.php` → `business_discovery.categories`, `radius_km`

---

### 2.2 Civic Source Discovery

**When:** Manual or scheduled  
**Command:** `php artisan civic:discover-sources` (or equivalent)  
**Service:** `CivicSourceCollectionService::discoverSourcesForRegion()`

Civic sources are **separate** from `NewsSource`. They use the `CivicSource` model and platform-specific services.

**Flow:**

1. **Legistar**: `LegistarService::discoverClient(cityName, state)` — finds Legistar API client for the city. Creates `CivicSource` with `platform = legistar`, `api_endpoint`, `api_client_name`
2. **CivicPlus**: Generate municipal URL patterns (e.g., `https://{city}.org`, `https://www.{city}.gov`). For each URL, `CivicPlusService::detectCivicPlus()` checks for CivicPlus HTML signatures. Creates `CivicSource` with platform-specific config
3. **Nixle**: Create `CivicSource` for region ZIP codes. `NixleService::createSourceForZipCodes()` sets up alert collection

**Civic platforms:**

| Platform | Detection | Collection |
|----------|-----------|------------|
| Legistar | URL/HTML contains `legistar` | Legistar API (`/v1/{client}/events`) |
| CivicPlus | HTML: `civicplus`, `civicengage`, `/agendacenter`, `/rss.aspx` | RSS or scrape |
| Nixle | URL `nixle.com` or HTML `nixle` | Nixle API/alerts |
| Granicus Media | HTML/URL `granicus.com` | Granicus API |

---

### 2.3 Direct News Sources (NewsSource + CollectionMethod)

Direct sources are `NewsSource` records with one or more `CollectionMethod` records.

**Collection method types (news):**

| Type | Description | Fetcher |
|------|-------------|---------|
| `rss` | RSS/Atom feed | `RssCollectionService` |
| `scrape` | Web scraping | `AdaptiveFetcherService` (HTTP, Playwright, AI extract) |
| `civicplus` | CivicPlus-specific | (Civic pipeline) |
| `nixle` | Nixle-specific | (Civic pipeline) |

**Auto-configuration:** `AdaptiveFetcherService::autoConfigureMethod()` can be called when adding a source:

1. Detect platform via `PlatformDetectorService`
2. Try to discover RSS (link tags, common paths like `/feed`, `/rss`)
3. If RSS found → create `TYPE_RSS` method
4. Else → create `TYPE_SCRAPE` with platform-specific selectors and fetch method

---

## 3. Event Source Roll-Out

### 3.1 During Business Discovery

When a `NewsSource` is created from a business, the system runs an **event platform scan**:

1. HTTP GET the `website_url`
2. `EventPlatformDetectorService::detectFromHtml(url, html)` returns:
   - `platforms`: e.g. `['eventbrite', 'tribe_events']`
   - `event_urls`: e.g. `['/events', '/calendar']`
   - `ical_urls`: e.g. `['https://example.com/feed.ics']`
3. If platforms found:
   - Update `NewsSource.content_types` to include `'events'`
   - Store `event_platform_slugs` and `event_paths` in `platform_config`
   - Create `CollectionMethod` with `method_type = 'event_calendar'`, `endpoint_url` = first event URL
4. For each `ical_url`: Create `CollectionMethod` with `method_type = 'ical'`, `endpoint_url` = iCal URL

### 3.2 Manual Event Source Scan

**Command:** `php artisan newsroom:scan-events`

**Options:**

- `--source=<id>` — Scan a specific `NewsSource` by ID
- `--url=<url>` — Scan a single URL (testing)
- `--all` — Scan all active sources with `website_url`

**Flow:**

1. Fetch each source URL
2. Run `EventPlatformDetectorService::detectFromHtml()`
3. Update `content_types`, `platform_config`
4. Create/update `event_calendar` and `ical` collection methods
5. Output report: platforms found, event URLs, methods created

### 3.3 Event Platforms Detected

| Platform | HTML Signatures |
|----------|-----------------|
| Eventbrite | `eventbrite.com`, `eventbrite-s3`, `ebstatic.com`, `eventbrite` |
| Meetup | `meetup.com`, `meetup.nyc3`, `meetup` |
| The Events Calendar | `tribe-events`, `tribe_events`, `the-events-calendar` |
| All-in-One Event Calendar | `ai1ec-`, `ai1ec_event` |
| Events Manager | `em-item`, `events-manager`, `em_event` |
| EventON | `eventon`, `evo_event` |
| Full Calendar | `fullcalendar`, `fc-event` |
| Google Calendar | `calendar.google.com` |
| Facebook Events | `facebook.com/events`, `fb.com/events` |
| Schema.org Event | `"@type":"Event"` in JSON-LD |
| iCal | `.ics` in link href |

---

## 4. Source Types and Page Handling

### 4.1 Platform Detection (PlatformDetectorService)

Before fetching, the system identifies the platform using HTTP headers and HTML (first ~15KB).

**Detection order (most specific first):**

1. **Government:** CivicPlus, Granicus, Legistar, Nixle, CivicLive
2. **CMS:** WordPress, Drupal, Joomla, Ghost
3. **Website builders:** Squarespace, Wix, Weebly, GoDaddy
4. **Ecommerce:** Shopify
5. **Event:** Eventbrite, Facebook
6. **News:** Patch, Substack
7. **Generic:** Static HTML, SPA (JavaScript)

**Platform profiles** (`PlatformProfile` / `PlatformProfileSeeder`) store:

- `best_fetch_method`: `rss`, `http_get`, `playwright`, `ai_extract`, `scrapingbee`, `scrapingbee_js`
- `content_selectors`: CSS/XPath for article extraction
- `rss_patterns`: e.g. `/feed`, `/rss.xml`
- `needs_js_rendering`: whether Playwright/JS rendering is required

### 4.2 Adaptive Fetcher (AdaptiveFetcherService)

For each `CollectionMethod`, the fetcher chooses how to collect:

| Condition | Action |
|-----------|--------|
| `method_type === TYPE_RSS` | `RssCollectionService::collect()` |
| Source has trusted platform profile | Use profile’s `best_fetch_method` |
| `requires_javascript === true` | Playwright or ScrapingBee JS |
| Default | HTTP GET → DOM extraction → if empty, AI extract |

**Fetch methods:**

- **RSS:** Parse feed, create `RawContent` per item
- **HTTP GET:** Fetch HTML, extract with platform selectors or generic `article`, `.post`
- **AI Extract:** Strip HTML to text, store as single `RawContent` for classification
- **Playwright:** `WebScrapingService::scrape()` with JS rendering
- **ScrapingBee:** External API for JS-heavy pages

### 4.3 Civic Page Handling

Civic content uses a **separate pipeline**:

| Platform | Service | Content Types |
|----------|---------|---------------|
| **Legistar** | `LegistarService` | Meetings, agendas, matters. Fetches from `https://webapi.legistar.com/v1/{client}/Events` |
| **CivicPlus** | `CivicPlusService` | News, alerts, documents. RSS at `/rss.aspx` or scrape |
| **Nixle** | `NixleService` | Alerts, advisories. API or scrape |
| **Granicus Media** | `GranicusMediaService` | Government media |

**Flow:**

1. `ProcessSingleCivicSourceJob` → `CivicSourceCollectionService::collectFromSource()`
2. Platform service returns raw items (meetings, alerts, etc.)
3. Each item stored as `CivicContentItem` with `content_hash` for deduplication
4. `processPendingItems()` converts `CivicContentItem` → `NewsArticle` (with `source_type = 'civic_legistar'`, etc.)

**Civic content types:** `meeting`, `agenda`, `alert`, `advisory`, `matter`, `news`

---

## 5. News Collection and Identification

### 5.1 Phase 2 Dispatch

**Entry:** `ProcessRegionDailyWorkflowJob` → `ProcessPhase2NewsCollectionJob`

**Jobs dispatched:**

| Job | When | Produces |
|-----|------|----------|
| `ProcessCategoryNewsCollectionJob` | Categories due today | Dispatches `ProcessSingleCategoryNewsCollectionJob` per category |
| `ProcessDirectSourceCollectionJob` | Always | `NewsArticle` from RSS/scrape via `RawContent` |
| `ProcessEventCalendarCollectionJob` | Event methods exist | `Event` from iCal/schema.org |
| `ProcessBusinessNewsCollectionJob` | Per business (frequency-filtered) | `NewsArticle` from SerpAPI |
| `ProcessSingleCivicSourceJob` | Per civic source | `CivicContentItem` → later `NewsArticle` |

### 5.2 Direct Source → NewsArticle Bridge

`ProcessDirectSourceCollectionJob`:

1. Get `CollectionMethod` records due for collection (excluding `event_calendar`, `ical`)
2. For each method: `AdaptiveFetcherService::fetch()` → array of `RawContent`
3. For each `RawContent`:
   - **Deduplicate:** `content_hash = sha256(title|url)`. Skip if exists in `NewsArticle` for region
   - **Create** `NewsArticle` with `source_type = 'direct_source'`, `content_hash`, `processed = false`
   - **Dual extraction:** If `source_html` present and event collection enabled, run `SchemaOrgEventParser` and create `Event` records (see §8)

### 5.3 Business News (SerpAPI)

`ProcessBusinessNewsCollectionJob` → `NewsCollectionService::fetchNewsForBusiness()`:

1. Call `SerpApiService::fetchNewsForBusiness(business)` — Google News search for business name + region
2. For each result: `storeNewsArticle()` with deduplication via `content_hash`
3. Creates `NewsArticle` with `source_type` from SerpAPI, `business_id`

### 5.4 Category News

`ProcessSingleCategoryNewsCollectionJob`:

1. `NewsCollectionService::fetchSingleCategoryNews(region, category)`
2. SerpAPI search using `category_news_terms` from config (e.g., `night_club` → `entertainment`)
3. Store as `NewsArticle` with category metadata

### 5.5 News Deduplication

- **RawContent:** `content_hash` = `sha256(title|url)`. `RawContent::isDuplicate(hash, community_id)`
- **NewsArticle:** Same hash + `region_id` before create
- **CivicContentItem:** `content_hash` from title, url, external_id. `CivicContentItem::isDuplicate(hash, source)`

---

## 6. Event Collection and Identification

### 6.1 Direct Event Collection (ProcessEventCalendarCollectionJob)

For `CollectionMethod` with `method_type` in `['event_calendar', 'ical']`:

1. **iCal:** `EventCollectionService::fetchFromIcal(icalUrl, regionId)` — parse with `johngrogg/ics-parser`, extract SUMMARY, DTSTART, LOCATION, UID, etc.
2. **Event calendar (schema.org):** HTTP GET endpoint, `SchemaOrgEventParser::parse(html)` — extract `@type: Event` from JSON-LD
3. For each event: `EventCollectionService::createEvent()` with deduplication (see §8)

### 6.2 Schema.org During Direct Source Fetch

When `ProcessDirectSourceCollectionJob` fetches HTML (e.g., AI extract path stores `source_html`):

1. After bridging to `NewsArticle`, if `source_html` exists and event collection enabled:
2. `EventCollectionService::extractSchemaOrgEvents(html, pageUrl)`
3. For each parsed event: `createEvent()` with `source_type = 'schema_org'`

### 6.3 AI Extraction from Articles

**Parallel pipeline:** `ProcessEventExtractionJob` (dispatched when Phase 2 jobs complete)

1. Get `NewsArticle` without `EventExtractionDraft`
2. **Detection:** `EventExtractionService::detectEventInArticle()` — Prism AI checks if article contains event info
3. **Extraction:** For detected articles, extract title, date, venue, description, etc. via AI
4. **Validation:** Match venues/performers, compute quality score
5. **Publishing:** `EventPublishingService::publishDraft()` — creates `Event` with deduplication

---

## 7. Article Creation Pipeline (Phases 3–7)

All `NewsArticle` records with `processed = false` enter this pipeline.

### 7.1 Phase 3: Shortlisting

**Job:** `ProcessPhase3ShortlistingJob` → dispatches `ProcessSingleArticleScoringJob` per article

**Flow:**

1. Get unprocessed `NewsArticle` for region
2. For each: AI relevance scoring (location verification, topic tags, score 0–100)
3. Create `NewsArticleDraft` with `status = 'shortlisted'` if above threshold
4. When all scoring jobs complete → `ProcessPhase3SelectionJob` (or similar) selects top drafts

### 7.2 Phase 4: Fact-Checking

**Job:** `ProcessPhase4FactCheckingJob` → `ProcessSingleDraftFactCheckingJob` per draft

**Flow:**

1. Generate outline via AI
2. Extract factual claims from outline
3. Verify each claim (web search, confidence score)
4. Create `NewsFactCheck` records
5. Update draft `status = 'outline_generated'`

### 7.3 Phase 5: Final Selection

**Job:** `ProcessPhase5FinalSelectionJob` → `ProcessSingleDraftEvaluationJob`

**Flow:**

1. Quality evaluation (content, facts, relevance, professionalism)
2. Select top N drafts for generation
3. Update `status = 'selected_for_generation'`

### 7.4 Phase 6: Article Generation

**Job:** `ProcessPhase6GenerationJob` → `ProcessSingleArticleGenerationJob`

**Flow:**

1. `ArticleGenerationService::generateFinalArticle()` — Prism AI generates full article from outline + facts
2. Fetch featured image (Unsplash or metadata)
3. Update draft `status = 'ready_for_publishing'`

### 7.5 Phase 7: Publishing

**Job:** `ProcessPhase7PublishingJob`

**Flow:**

1. `PublishingService::publishArticles()` — for drafts `ready_for_publishing`
2. Create `DayNewsPost` with content, SEO metadata, featured image
3. Update draft `status = 'published'`

---

## 8. Event Creation and Deduplication

### 8.1 Event Creation Points

Events are created from:

1. **AI extraction:** `EventPublishingService::publishDraft(EventExtractionDraft)`
2. **Direct collection:** `EventCollectionService::createEvent()` — from iCal, schema.org, event_calendar methods
3. **Schema.org dual extraction:** During `ProcessDirectSourceCollectionJob` when HTML contains Event JSON-LD

### 8.2 Deduplication Strategy (EventDeduplicationService)

Before creating an `Event`, `findDuplicate(eventData, regionId)` is called. Checks in order:

| Priority | Key | Check |
|----------|-----|-------|
| 1 | `source_url` | `Event::where('source_url', $url)->first()` |
| 2 | `external_id` | `Event::where('external_id', $id)->first()` |
| 3 | `content_hash` | `Event::where('content_hash', $hash)->first()` |
| 4 | Fuzzy | Same region, same date (±tolerance), similar title (configurable %), optional venue match |

**Content hash:** `sha256(normalized_title|date|venue_name|url)`

**Configuration:** `config/news-workflow.php` → `event_collection.deduplication`:

- `title_similarity_threshold`: default 85
- `require_venue_match`: default false
- `date_tolerance_days`: default 0

### 8.3 Event Model Fields for Deduplication

| Field | Purpose |
|-------|---------|
| `source_url` | Canonical event URL |
| `external_id` | Platform ID (Eventbrite, Meetup UID, iCal UID) |
| `content_hash` | SHA-256 of title+date+venue+url |

### 8.4 Flow: AI-Extracted Event

1. `EventExtractionService` creates `EventExtractionDraft` with `extracted_data`
2. `EventPublishingService::publishDraft()`:
   - Build `eventDataForDedup` from draft + `newsArticle.url`
   - `EventDeduplicationService::findDuplicate()` — if found, attach draft to existing event, return
   - Else create `Event` with `source_url`, `external_id`, `content_hash`, attach region
   - Update draft `status = 'published'`, `published_event_id`

### 8.5 Flow: Direct-Collected Event

1. `EventCollectionService::createEvent(data, region, sourceType)`:
   - `findDuplicate()` — if found, log and return null
   - Geocode venue if needed
   - Create `Event` with `source_type = 'direct_collection'` or `'schema_org'`
   - Attach region

---

## 9. Follow-Up and Story Threads

### 9.1 Story Analysis

**Service:** `StoryAnalysisService`

- `analyzeArticle()` — Is article part of an ongoing story?
- `findMatchingThread()` — Match to existing `StoryThread`
- `createThreadFromArticle()` — Create new thread
- `generateFollowUpSuggestions()` — Suggest follow-up angles

### 9.2 Story Follow-Up

**Service:** `StoryFollowUpService`

- `processNewArticle()` — Match new article to threads
- `processHighEngagementArticles()` — Create threads from high-engagement articles
- `updateThreadStatuses()` — Update based on activity
- `generateFollowUpArticles()` — Generate follow-up suggestions

### 9.3 Engagement Scoring

**Service:** `EngagementScoringService`

- Scores articles for engagement potential
- `getHighEngagementUnthreaded()` — Articles without threads that may need them

---

## 10. Commands and Entry Points

### 10.1 Workflow Commands

| Command | Purpose |
|---------|---------|
| `php artisan news:run-daily` | Dispatch `ProcessRegionDailyWorkflowJob` per region (Phase 2→7) |
| `php artisan news:run-daily --region=<id>` | Run for single region |
| `php artisan news:run-business-discovery` | Phase 1: Business discovery |
| `php artisan news:process-collected` | Process collected news (legacy) |

### 10.2 Newsroom Commands

| Command | Purpose |
|---------|---------|
| `php artisan newsroom:scan-events` | Scan sources for event platforms |
| `php artisan newsroom:scan-events --all` | Scan all active sources |
| `php artisan newsroom:scan-events --source=<id>` | Scan specific source |
| `php artisan newsroom:scan-events --url=<url>` | Scan single URL (testing) |
| `php artisan newsroom:collect` | Collect from sources |
| `php artisan newsroom:process` | Process collected content |
| `php artisan newsroom:classify` | Classify content |
| `php artisan newsroom:run` | Full newsroom workflow |
| `php artisan newsroom:stats` | Show statistics |

### 10.3 Civic Commands

| Command | Purpose |
|---------|---------|
| `php artisan civic:discover-sources` | Discover Legistar, CivicPlus, Nixle for regions |
| `php artisan civic:manage` | Manage civic sources |

### 10.4 Event Commands

| Command | Purpose |
|---------|---------|
| `php artisan events:extract` | Run event extraction from articles |

### 10.5 Seeding

| Command | Purpose |
|---------|---------|
| `php artisan db:seed --class=PlatformProfileSeeder` | Seed platform profiles (WordPress, CivicPlus, etc.) |

---

## Appendix A: Collection Method Types Summary

| Type | Source | Fetcher | Output |
|------|--------|---------|--------|
| `rss` | NewsSource | RssCollectionService | RawContent → NewsArticle |
| `scrape` | NewsSource | AdaptiveFetcherService | RawContent → NewsArticle (+ schema.org events) |
| `event_calendar` | NewsSource | EventCollectionService | Event |
| `ical` | NewsSource | EventCollectionService | Event |
| `civicplus` | (CivicSource) | CivicPlusService | CivicContentItem → NewsArticle |
| `nixle` | (CivicSource) | NixleService | CivicContentItem → NewsArticle |
| Legistar | CivicSource | LegistarService | CivicContentItem → NewsArticle |

---

## Appendix B: Configuration Reference

**`config/news-workflow.php`:**

- `business_discovery` — Categories, radius, enabled
- `news_collection` — Enabled, max articles, lookback
- `event_collection` — Enabled, deduplication thresholds, max events per source
- `event_extraction` — AI extraction thresholds, venue matching
- `shortlisting`, `fact_checking`, `final_selection`, `article_generation`, `publishing` — Phase config
- `ai_models` — OpenRouter model per phase
- `apis` — SerpAPI, ScrapingBee keys

**`config/civic-sources.php`:**

- Civic platform settings, API endpoints
