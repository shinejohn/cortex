# News and Events Workflow — Complete Reference

This document explains **every workflow** in the creation of news sources, news items, articles, events, event sources, event items, reporter follow-up, follow-up stories, and announcements — including **when**, **why**, and **under what conditions** each is executed.

---

## Table of Contents

1. [Schedule Overview](#schedule-overview)
2. [News Source Creation](#news-source-creation)
3. [News Item (RawContent) Creation](#news-item-rawcontent-creation)
4. [Article Creation — Two Pipelines](#article-creation--two-pipelines)
5. [Event Creation](#event-creation)
6. [Event Source & Event Item Creation](#event-source--event-item-creation)
7. [Reporter Follow-Up](#reporter-follow-up)
8. [Follow-Up Story Creation](#follow-up-story-creation)
9. [Announcement Creation](#announcement-creation)
10. [Supporting Workflows](#supporting-workflows)

---

## Schedule Overview

| Schedule | Command/Job | Frequency |
|----------|-------------|-----------|
| Daily workflow | `news:run-daily` | 6:00 AM UTC |
| Business discovery | `news:discover-businesses` | 1st of month, 3:00 AM (commented out) |
| AI Newsroom collect | `newsroom:collect` | Every 15 min |
| AI Newsroom classify | `newsroom:classify` | Every 10 min |
| AI Newsroom process | `newsroom:process` | Every 5 min |
| Wire service collection | `ProcessWireServiceCollectionJob` | Every 15 min |
| Raw content classification | `ProcessRawContentClassificationJob` | Every 10 min |
| Classified content routing | `ProcessClassifiedContentJob` | Every 15 min |
| Search trend mining | `SearchTrendMiningJob` | Daily |
| Top List | `TopListJob` | Weekly |
| Trend detection | `TrendDetectionJob` | Daily |

---

## News Source Creation

### When
- **Business Discovery** (Phase 1): Runs monthly via `news:discover-businesses` (currently commented out in schedule).
- **Manual**: Via `DiscoverCivicSourcesCommand` or admin.

### Why
To populate the system with sources that can produce news content.

### Conditions & Flow

#### 1. Business → NewsSource (from Google Places)

**Trigger**: `BusinessDiscoveryService::discoverBusinesses(Region)`  
**Called by**: `ProcessRegionBusinessDiscoveryJob` (from `news:discover-businesses`)

**Conditions for NewsSource creation**:
- Business has a `website`
- Business type is "newsy": `government`, `school`, `university`, `museum`, `library`, `police`, `fire_station`, `local_government_office`, `newspaper`, `news_media`, or category contains "news"

**Flow**:
1. `GooglePlacesService::discoverBusinessesForCategory(Region, category)` fetches businesses
2. `BusinessDiscoveryService::upsertBusiness()` creates/updates `Business`
3. `assignToRegion()` links business to region
4. `evaluateAndSetupNewsSource()` creates `NewsSource` when conditions met
5. Creates `CollectionMethod` (TYPE_SCRAPE) if none exists for news collection
6. Optionally runs `scanSourceForEvents()` for event platform detection

#### 2. Civic Source Discovery

**Trigger**: `DiscoverCivicSourcesCommand` or `CivicSourceCollectionService::discoverSourcesForRegion()`  
**Platforms**: Legistar, CivicPlus, Nixle, Granicus

**Flow**:
- Discovers government/civic URLs
- Creates `CivicSource` records
- Creates collection methods for meetings, agendas, alerts

#### 3. CollectionMethod Creation

**Types**: `rss`, `scrape`, `email`, `event_calendar`, `ical`  
**Conditions**: Source is active, has endpoint URL, is due for collection (`dueForCollection` scope)

---

## News Item (RawContent) Creation

### When
- **Wire service**: Every 15 min via `ProcessWireServiceCollectionJob`
- **RSS**: Every 15 min via `newsroom:collect` → `ProcessRssCollectionJob`
- **Web scraping**: Every 15 min via `newsroom:collect` → `ProcessWebScrapingJob`
- **Press release**: On API submission or email intake
- **Direct source collection**: During daily workflow Phase 2 via `ProcessDirectSourceCollectionJob`

### Why
To ingest raw content from all configured sources before classification and routing.

### Conditions & Flow by Source Type

| Source | Job/Service | Creates RawContent When |
|--------|-------------|-------------------------|
| Wire feed | `WireServiceCollectionService::collectFromFeed()` | Feed is due, item not duplicate (by content_hash) |
| RSS | `RssCollectionService::collect()` | Item not duplicate (content_hash + community_id) |
| Web scrape | `WebScrapingService::scrape()` | Scraped content parsed successfully |
| Press release | `PressReleaseIntakeService::processWebSubmission()` | API/portal submission |
| Direct source | `AdaptiveFetcherService` (via `ProcessDirectSourceCollectionJob`) | Method due, content fetched |

**RawContent fields set**:
- `classification_status`: `pending`
- `routing_status`: `pending` (wire, press release) or null (RSS/scrape)
- `processing_status`: `pending`
- `community_id`, `region_id` (from source or dateline)

---

## Article Creation — Two Pipelines

There are **two distinct pipelines** that produce articles (DayNewsPost or NewsArticle):

### Pipeline A: Business Content → ContentRoutingService → NewsArticle

**When**: Every 15 min via `ProcessClassifiedContentJob`  
**Input**: RawContent with `classification_status=classified`, `routing_status=pending`  
**Typical sources**: Wire service, press release (content with explicit routing_status)

**Flow**:
1. `ContentRoutingService::routeClassifiedContent()` fetches `classifiedAndPendingRouting` RawContent
2. For each item, `routeSingleItem()`:
   - Resolves regions via `GeographicScopeService::resolveRegions()`
   - **If article-worthy** (primary_type, news_value, tier): creates `NewsArticle` per region
   - **If announcement-type**: creates `Announcement` per region
   - **If event-bearing**: creates `Event` from `event_data`
   - **If obituary**: creates `Memorial` per region
3. `markRouted()` sets `routing_status=routed`, `processing_status=completed`

**Conditions for NewsArticle**:
- `isArticleWorthy(primaryType, newsValue, tier)` returns true
- At least one region resolved

**NewsArticle** then enters the **Daily Workflow** (Phases 3–7) if it has `processed=false`.

---

### Pipeline B: AI Newsroom → ProcessContentByTierJob → DayNewsPost

**When**: Every 5 min via `newsroom:process` → `DispatchProcessingJob` → `ProcessContentByTierJob`  
**Input**: RawContent with `classification_status=classified`, `processing_status=pending`  
**Typical sources**: RSS, web scraping (content without routing_status or not yet routed)

**Flow**:
1. `DispatchProcessingJob` fetches `pendingProcessing()` RawContent
2. Dispatches `ProcessContentByTierJob` per item (breaking first, then by priority)
3. `ProcessContentByTierJob`:
   - Calls `ArticleGenerationService::generateBrief/Standard/Full()` based on `processing_tier`
   - Creates `DayNewsPost` directly (no NewsArticle)
   - If `has_event` and `event_data`: creates Event (placeholder in current impl)
   - `markProcessed()` sets `processing_status=completed`
   - Dispatches `AnalyzeStoryPotentialJob` for story threading

**Conditions**:
- RawContent is classified and pending processing
- Not yet routed (or routed flow doesn’t consume it)

---

### Pipeline C: Daily Workflow (Phases 2–7) → DayNewsPost

**When**: 6:00 AM UTC via `news:run-daily`  
**Input**: `NewsArticle` (from SERP API, civic, direct sources, category news)  
**Output**: `DayNewsPost`

**Flow**:
1. **Phase 2** (`ProcessPhase2NewsCollectionJob`): Collects news
   - `ProcessCategoryNewsCollectionJob`: SerpAPI category news → NewsArticle
   - `ProcessDirectSourceCollectionJob`: RSS/scrape/civic → NewsArticle (bridges RawContent to NewsArticle where applicable)
   - `ProcessEventCalendarCollectionJob`: iCal/schema.org events
   - `ProcessBusinessNewsCollectionJob`: SerpAPI business news → NewsArticle
   - `ProcessSingleCivicSourceJob`: Legistar/CivicPlus/Nixle → CivicContentItem → NewsArticle
2. When last Phase 2 job completes: dispatches **Phase 3** and **ProcessEventExtractionJob** (parallel)
3. **Phase 3** (`ProcessPhase3ShortlistingJob`): Scores articles, creates `NewsArticleDraft` (shortlisted)
4. **Phase 4** (`ProcessPhase4FactCheckingJob`): Outlines, fact-checking
5. **Phase 5** (`ProcessPhase5FinalSelectionJob`): Final selection → `selected_for_generation`
6. **Phase 6** (`ProcessPhase6GenerationJob`): Generates full articles → `ready_for_publishing`
7. **Phase 7** (`ProcessPhase7PublishingJob`): Publishes → `DayNewsPost`

**Conditions for publishing**:
- Draft status `ready_for_publishing`
- `TrafficControlService::shouldPublishNow(draft)` (quota, mix, timing)

---

## Event Creation

### When
- **From articles**: When last Phase 2 job completes → `ProcessEventExtractionJob` (parallel to Phase 3)
- **From RawContent**: Via `ContentRoutingService` when `event` in content_types and `event_data['is_event']`
- **From event calendars**: `ProcessEventCalendarCollectionJob` (iCal, schema.org)

### Why
To surface events for calendars and listings.

### Conditions & Flow

#### 1. Event Extraction from NewsArticle

**Trigger**: `ProcessEventExtractionJob` (after Phase 2 completes)  
**Service**: `EventExtractionService::extractEventsForRegion()`

**Conditions**:
- `news-workflow.event_extraction.enabled` = true
- NewsArticle has no `eventExtractionDrafts` yet
- Limit: `max_events_per_region` (default 20)

**Flow**:
1. Detect events in article via AI
2. Create `EventExtractionDraft`
3. Extract structured data (title, date, venue, performers)
4. Match venue (`VenueMatchingService`), performers (`PerformerMatchingService`)
5. `EventPublishingService::publishDraft()` → deduplication → create `Event`
6. Status: `published` if `shouldAutoPublish()`, else `draft`

#### 2. Event from RawContent (ContentRoutingService)

**Conditions**: `event` in content_types, `event_data['is_event']` true  
**Flow**: `createEventFromRawContent()` creates `Event` from `event_data`

#### 3. Event from Event Calendar Collection

**Trigger**: `ProcessEventCalendarCollectionJob` (Phase 2)  
**Sources**: CollectionMethod TYPE_EVENT_CALENDAR, TYPE_ICAL  
**Service**: `EventCollectionService` — parses iCal/schema.org, creates Event records

---

## Event Source & Event Item Creation

### Event Source
- **Business discovery**: `scanSourceForEvents()` on NewsSource with website
- **Event platform detection**: `EventPlatformDetectorService` detects Eventbrite, Meetup, etc.
- **Civic sources**: Legistar, CivicPlus create CivicSource records that yield meetings/agendas

### Event Item
- **CivicContentItem**: Created by `CivicSourceCollectionService::storeContentItem()` when collecting from Legistar/CivicPlus/Nixle
- **Event**: Created by EventExtractionService, ContentRoutingService, or EventCollectionService (see above)

---

## Reporter Follow-Up

### When
Immediately after a **business** article is published (Phase 7).

### Why
To notify featured businesses that they were covered and encourage sharing.

### Conditions & Flow

**Trigger**: `PublishingService::publishDraft()` dispatches `ReporterOutreachJob` when `category === 'business'`

**Conditions**:
- `news-workflow.business_content.reporter_outreach_enabled` = true
- Post category is `business`
- Post has at least one region
- `ReporterOutreachService::collectContacts()` finds businesses with valid emails

**Flow**:
1. `ReporterOutreachService::sendOutreach(DayNewsPost)`
2. Collect contacts from post (BusinessMention, metadata)
3. For each contact with valid email: generate personalized email, send, create `ReporterOutreachRequest`
4. Skips if `ReporterOutreachRequest` already exists for (post_id, email)

---

## Follow-Up Story Creation

### When
- **ProcessStoryFollowUpsJob**: On-demand via `ManageStoryThreads` command (not in default schedule)
- **AnalyzeStoryPotentialJob**: After `ProcessContentByTierJob` creates a DayNewsPost

### Why
To identify ongoing stories and create follow-up opportunities.

### Conditions & Flow

#### 1. Story Thread Creation

**Trigger**: `StoryFollowUpService::processNewArticle()` or `processHighEngagementArticles()`  
**Conditions**:
- Article matches existing thread (`StoryAnalysisService::findMatchingThread()`), or
- Article is high-engagement and unthreaded, and `analyzeArticle()` returns `is_ongoing_story`

**Flow**:
- `createThreadFromArticle()` or `addArticle()` to existing thread
- Creates `StoryThread` with key entities, predicted beats

#### 2. Follow-Up Request Creation

**Trigger**: `StoryFollowUpService::processTrigger()` when a `StoryFollowUpTrigger` fires  
**Trigger types**: TIME_BASED, ENGAGEMENT, DATE_EVENT, RESOLUTION, SCHEDULED  
**Flow**:
- `createFollowUpRequest()` creates editorial queue entry (logged; no persistent table in current impl)
- Suggested angle generated from trigger type

---

## Announcement Creation

### When
Every 15 min via `ProcessClassifiedContentJob` → `ContentRoutingService`

### Why
To surface announcement-type content (e.g. community notices, government announcements) without full article treatment.

### Conditions & Flow

**Conditions**: `isAnnouncementContent(primaryType, contentTypes, newsValue, tier)` returns true  
**Flow**: `ContentRoutingService::createAnnouncement()` creates `Announcement` per resolved region

---

## Supporting Workflows

### Filler Content
- **FillerBucketService::deployForRegion()**: Deploys filler articles when region is below daily publishing target (not currently scheduled; would run after main workflow)
- **FillerBucketService::replenishBuckets()**: AI-generates filler when buckets are low (weekly replenishment)

### Top List & Polls
- **TopListJob** (weekly): `TopListService::runForRegion()` — selects topic, discovers businesses, generates editorial, publishes DayNewsPost, creates Poll
- **PollSolicitationJob**: Dispatched when poll is created; emails featured businesses during voting period

### Search Trends & SEO
- **SearchTrendMiningJob** (daily): Mines SerpAPI trending searches, populates `SearchTrend`, `SeoTarget`
- **TrendDetectionJob** (daily): Cross-region trend analysis; feeds Top List topics and Filler replenishment

### Reporter Response
- **ReporterResponseService**: Processes replies to reporter outreach; creates `SalesOpportunity` when business responds

---

## Summary: Creation Conditions

| Output | Created When | Primary Trigger |
|--------|--------------|-----------------|
| **NewsSource** | Business has website + newsy type | Business discovery |
| **RawContent** | Wire/RSS/scrape/press release/direct source | Scheduled collection jobs |
| **NewsArticle** | ContentRoutingService routes article-worthy RawContent; or Phase 2 collects from SERP/civic/direct | ProcessClassifiedContentJob; Phase 2 |
| **DayNewsPost** | ProcessContentByTierJob (from RawContent); or Phase 7 publishes draft | newsroom:process; news:run-daily |
| **Event** | Event extraction from article; RawContent event_data; event calendar collection | ProcessEventExtractionJob; ContentRoutingService; ProcessEventCalendarCollectionJob |
| **Announcement** | ContentRoutingService routes announcement-type RawContent | ProcessClassifiedContentJob |
| **Memorial** | ContentRoutingService routes obituary RawContent | ProcessClassifiedContentJob |
| **ReporterOutreachRequest** | Business article published | PublishingService → ReporterOutreachJob |
| **StoryThread** | Article matches thread or starts ongoing story | StoryFollowUpService |
| **Follow-up request** | StoryFollowUpTrigger fires | ProcessStoryFollowUpsJob |
