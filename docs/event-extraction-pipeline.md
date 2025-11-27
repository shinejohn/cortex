# Event Extraction Pipeline Documentation

## Overview

The Event Extraction Pipeline is an AI-powered system that automatically extracts structured event data from news articles and populates the GoEventCity events system. It runs in parallel with the existing news workflow pipeline after Phase 2 (News Collection).

## Architecture

### Pipeline Flow

```
News Articles (Phase 2)
    ↓
Event Detection (AI)
    ↓
Event Extraction (AI)
    ↓
Venue/Performer Matching
    ↓
Quality Validation
    ↓
Event Publishing (auto or draft)
```

### Status Workflow

Event drafts progress through the following states:

1. **pending** → Initial state when created
2. **detected** → AI detected an event in the article
3. **extracted** → Event details extracted from article
4. **validated** → Quality score calculated, ready for publishing
5. **published** or **rejected** → Final states

## Database Schema

### Tables Created

#### `event_extraction_drafts`
Stores AI-extracted event data before publishing as events.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `news_article_id` | UUID | Source news article |
| `region_id` | UUID | Target region |
| `status` | string | Workflow status |
| `detection_confidence` | decimal(5,2) | AI confidence (0-100) |
| `extraction_confidence` | decimal(5,2) | AI confidence (0-100) |
| `quality_score` | decimal(5,2) | Overall quality (0-100) |
| `extracted_data` | JSON | Raw extracted event data |
| `matched_venue_id` | UUID | Matched/created venue |
| `matched_performer_id` | UUID | Matched/created performer |
| `published_event_id` | UUID | Published event reference |
| `ai_metadata` | JSON | Model info, tokens, etc. |
| `rejection_reason` | text | Why event was rejected |

#### `event_region` (Pivot Table)
Many-to-many relationship between events and regions.

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `event_id` | UUID | Event reference |
| `region_id` | UUID | Region reference |

#### `events` Table Additions
Source tracking fields added to existing events table.

| Column | Type | Description |
|--------|------|-------------|
| `source_news_article_id` | UUID | Source article (nullable) |
| `source_type` | string | 'manual' or 'ai_extracted' |

## Configuration

Located in `config/news-workflow.php` under `event_extraction` key:

```php
'event_extraction' => [
    'enabled' => true,
    'min_detection_confidence' => 60,      // Skip if below
    'min_extraction_confidence' => 70,     // Skip if below
    'auto_publish_threshold' => 85,        // ≥85 = published, <85 = draft
    'venue_match_threshold' => 0.85,       // Levenshtein similarity
    'performer_match_threshold' => 0.85,   // Levenshtein similarity
    'system_workspace_id' => null,         // Auto-created if null
    'system_workspace_name' => 'AI Event Extraction',
    'max_events_per_region' => 20,
    'category_mapping' => [...],           // Maps AI categories to Event categories
]
```

### Environment Variables

```bash
# Event Extraction
NEWS_WORKFLOW_EVENT_EXTRACTION_ENABLED=true
NEWS_WORKFLOW_EVENT_MIN_DETECTION=60
NEWS_WORKFLOW_EVENT_MIN_EXTRACTION=70
NEWS_WORKFLOW_EVENT_AUTO_PUBLISH_THRESHOLD=85
NEWS_WORKFLOW_VENUE_MATCH_THRESHOLD=0.85
NEWS_WORKFLOW_PERFORMER_MATCH_THRESHOLD=0.85
NEWS_WORKFLOW_SYSTEM_WORKSPACE_ID=
NEWS_WORKFLOW_SYSTEM_WORKSPACE_NAME="AI Event Extraction"
NEWS_WORKFLOW_MAX_EVENTS_PER_REGION=20

# Google Geocoding API
GOOGLE_MAPS_API_KEY=your_api_key_here

# AI Models for Event Processing
NEWS_WORKFLOW_AI_MODEL_EVENT_DETECTION=meta-llama/llama-3.1-8b-instruct
NEWS_WORKFLOW_AI_MODEL_EVENT_EXTRACTION=meta-llama/llama-3.1-8b-instruct
```

## Services

### 1. GeocodingService
**Location:** `app/Services/GeocodingService.php`
**Interface:** `app/Contracts/GeocodingServiceInterface.php`

Converts venue names and addresses to coordinates using Google Geocoding API.

**Key Methods:**
- `geocodeAddress(string $address): ?array`
- `geocodeVenue(string $venueName, ?string $address, ?string $regionName): ?array`
- `clearCache(string $address): bool`

**Features:**
- 30-day caching of geocoding results
- Returns: latitude, longitude, postal_code, google_place_id, formatted_address
- Fallback strategies for venue matching

### 2. VenueMatchingService
**Location:** `app/Services/News/VenueMatchingService.php`

Matches venue names to existing venues or creates new ones.

**Matching Strategy:**
1. Exact match (case-insensitive)
2. Fuzzy match using Levenshtein distance (≥85% similarity)
3. Create new venue under system workspace with geocoding

**Fields for New Venues:**
- name, description, venue_type, capacity
- address, latitude, longitude, postal_code, google_place_id
- price_per_hour, price_per_event, price_per_day
- status, workspace_id

### 3. PerformerMatchingService
**Location:** `app/Services/News/PerformerMatchingService.php`

Matches performer names to existing performers or creates new ones.

**Matching Strategy:**
1. Exact match (case-insensitive)
2. Fuzzy match using Levenshtein distance (≥85% similarity)
3. Create new performer under system workspace

**Fields for New Performers:**
- name, genres (empty array), home_city ('Unknown')
- status, workspace_id

### 4. EventPublishingService
**Location:** `app/Services/News/EventPublishingService.php`

Publishes validated event drafts as events.

**Key Methods:**
- `publishDraft(EventExtractionDraft $draft): Event`
- `publishForRegion(Region $region): int`

**Publishing Logic:**
- Quality score ≥85 → status: 'published' (auto-publish)
- Quality score <85 → status: 'draft' (manual review)
- Attaches region via many-to-many pivot
- Sets source tracking fields

### 5. EventExtractionService (Orchestrator)
**Location:** `app/Services/News/EventExtractionService.php`

Orchestrates the entire event extraction pipeline.

**Key Methods:**
- `extractEventsForRegion(Region $region): array` - Returns stats
- `extractEventsForAllRegions(): array` - Process all active regions

**Pipeline Steps:**
1. Fetch pending articles for region
2. AI detection: Does article contain event info?
3. AI extraction: Extract structured event data
4. Venue matching: Find or create venue
5. Performer matching: Find or create performer (if applicable)
6. Quality validation: Calculate quality score
7. Publishing: Publish if quality ≥85, else draft

### 6. PrismAiService (Extended)
**Location:** `app/Services/News/PrismAiService.php`

Added two new AI methods for event processing:

**New Methods:**
- `detectEventInArticle(NewsArticle $article): array`
  - Returns: contains_event, confidence_score, event_date_mentioned, rationale

- `extractEventDetails(NewsArticle $article): array`
  - Returns: title, event_date, time, venue_name, venue_address, description
  - Also: category, subcategories, is_free, price_min, price_max
  - Optional: performer_name, badges, extraction_confidence

## Jobs

### ProcessEventExtractionJob
**Location:** `app/Jobs/News/ProcessEventExtractionJob.php`

Queued job that processes event extraction for a region.

**Usage:**
```php
ProcessEventExtractionJob::dispatch($region);
```

**Integration:**
Automatically dispatched by `ProcessBusinessNewsCollectionJob` after Phase 2 (News Collection).

## Artisan Commands

### 1. news-workflow:extract-events
**Location:** `app/Console/Commands/News/RunEventExtractionCommand.php`

Manually trigger event extraction for regions.

**Usage:**
```bash
# Extract events for specific region
php artisan news-workflow:extract-events --region=REGION_ID

# Extract events for all active regions
php artisan news-workflow:extract-events --all
```

**Output:**
- Detection stats
- Extraction stats
- Validation stats
- Publishing stats (auto-published vs drafts)

### 2. news-workflow:create-event-workspace
**Location:** `app/Console/Commands/News/CreateEventSystemWorkspaceCommand.php`

Creates the system workspace for AI-extracted events.

**Usage:**
```bash
php artisan news-workflow:create-event-workspace
```

**Purpose:**
- All AI-extracted events are created under this workspace
- Businesses can later "claim" these events
- Workspace name: "AI Event Extraction" (configurable)

## Models

### EventExtractionDraft
**Location:** `app/Models/EventExtractionDraft.php`

**Relationships:**
- `newsArticle()` - Source article
- `region()` - Target region
- `matchedVenue()` - Matched venue
- `matchedPerformer()` - Matched performer
- `publishedEvent()` - Published event

**Query Scopes:**
- `pending()`, `detected()`, `extracted()`, `validated()`, `published()`, `rejected()`

**Key Methods:**
- `shouldAutoPublish(): bool` - Check if quality ≥ threshold

**Casts:**
- `extracted_data` → array
- `ai_metadata` → array
- Decimal fields cast to string for precision

### Event Model Updates
**Location:** `app/Models/Event.php`

**New Relationships:**
- `regions()` - Many-to-many with regions
- `sourceNewsArticle()` - Source article reference

**New Scopes:**
- `manual()` - Manually created events
- `aiExtracted()` - AI-extracted events

### Region Model Updates
**Location:** `app/Models/Region.php`

**New Relationships:**
- `events()` - Many-to-many with events
- `eventExtractionDrafts()` - Pending extractions

### NewsArticle Model Updates
**Location:** `app/Models/NewsArticle.php`

**New Relationships:**
- `eventExtractionDrafts()` - Event drafts from this article

## Business Discovery Categories

Located in `config/news-workflow.php` under `business_discovery.categories`.

The system searches for news from these event-rich business types:

### Entertainment & Nightlife (9)
- `night_club`, `bar`, `performing_arts_theater`, `art_gallery`, `concert_hall`
- `movie_theater`, `stadium`, `casino`, `bowling_alley`

### Cultural & Educational (6)
- `museum`, `library`, `bookstore`, `tourist_attraction`
- `university`, `school`

### Recreation & Activities (5)
- `amusement_park`, `zoo`, `aquarium`, `park`, `campground`

### Food & Beverage (4)
- `restaurant`, `cafe`, `brewery`, `winery`

### Health & Wellness (2)
- `spa`, `gym`

### Commercial & Events (2)
- `shopping_mall`, `convention_center`

### Government & Civic (7)
- `city_hall`, `courthouse`, `local_government_office`, `town_hall`
- `police`, `fire_station`, `community_center`

## Testing

### Test Suite
**Location:** `tests/Feature/Services/NewsWorkflow/EventExtractionServiceTest.php`

**Coverage:**
- EventExtractionDraft model tests (3 tests)
- Event/Region relationship tests (3 tests)
- VenueMatchingService tests (4 tests)
- PerformerMatchingService tests (3 tests)
- EventPublishingService tests (2 tests)
- EventExtractionService integration tests (5 tests)

**Run Tests:**
```bash
php artisan test tests/Feature/Services/NewsWorkflow/EventExtractionServiceTest.php
```

**Total:** 20 tests, 55 assertions

### Test Factories

**EventExtractionDraftFactory:**
- States: `detected()`, `extracted()`, `validated()`, `published()`, `rejected()`
- Modifiers: `withVenue()`, `withPerformer()`, `withPublishedEvent()`
- Helpers: `forRegion()`, `forArticle()`

## Data Flow Example

### Scenario: Extract Concert Event from News Article

1. **News Article Created:**
   ```
   Title: "Local Band to Play at City Park This Saturday"
   Content: "The Blue Notes will perform at City Park Amphitheater
            this Saturday at 7 PM. Tickets are $15-25..."
   ```

2. **AI Detection:**
   ```json
   {
     "contains_event": true,
     "confidence_score": 92,
     "event_date_mentioned": true,
     "rationale": "Article mentions upcoming concert with date and venue"
   }
   ```

3. **AI Extraction:**
   ```json
   {
     "title": "The Blue Notes Live at City Park",
     "event_date": "2025-12-07T19:00:00",
     "time": "7:00 PM - 10:00 PM",
     "venue_name": "City Park Amphitheater",
     "venue_address": "123 Park Lane",
     "description": "Join us for an evening of live music...",
     "category": "music",
     "subcategories": ["outdoor", "live-music"],
     "is_free": false,
     "price_min": 15,
     "price_max": 25,
     "performer_name": "The Blue Notes",
     "badges": ["family-friendly", "outdoor"],
     "extraction_confidence": 88
   }
   ```

4. **Venue Matching:**
   - Searches for "City Park Amphitheater"
   - Not found → Geocodes address using Google API
   - Creates new venue with coordinates

5. **Performer Matching:**
   - Searches for "The Blue Notes"
   - Not found → Creates new performer

6. **Draft Created:**
   ```
   Status: validated
   Quality Score: 88
   Matched Venue: City Park Amphitheater (new)
   Matched Performer: The Blue Notes (new)
   ```

7. **Publishing Decision:**
   - Quality score (88) ≥ threshold (85)
   - Auto-publishes as status: 'published'
   - Attaches to region via pivot table
   - Sets source tracking: source_type='ai_extracted'

## Monitoring & Debugging

### Logs

Event extraction logs are written to Laravel's standard log:

```bash
tail -f storage/logs/laravel.log | grep -E "VenueMatchingService|PerformerMatchingService|EventPublishingService|EventExtractionService"
```

### Key Log Entries

**VenueMatchingService:**
- "Found matching venue" (exact/fuzzy match)
- "Created new venue" (with geocode status)

**PerformerMatchingService:**
- "Found matching performer" (exact/fuzzy match)
- "Created new performer"

**EventPublishingService:**
- "Published extracted event" (success)
- "Failed to publish extracted event" (error)

**EventExtractionService:**
- "Event detected in article" (detection)
- "Event extraction completed" (extraction)
- "Event validated and ready" (validation)
- "Event auto-published" or "Event saved as draft"

### Database Queries

**Check pending drafts:**
```sql
SELECT status, COUNT(*)
FROM event_extraction_drafts
GROUP BY status;
```

**Check auto-published events:**
```sql
SELECT COUNT(*)
FROM events
WHERE source_type = 'ai_extracted'
AND status = 'published';
```

**Check event-region relationships:**
```sql
SELECT r.name, COUNT(er.event_id) as event_count
FROM regions r
LEFT JOIN event_region er ON r.id = er.region_id
GROUP BY r.id, r.name;
```

## Best Practices

1. **Confidence Thresholds:**
   - Set detection threshold (60) to catch most events
   - Set extraction threshold (70) to ensure quality
   - Set auto-publish threshold (85) for high-confidence only

2. **Matching Thresholds:**
   - Keep venue/performer matching at 85% to avoid false positives
   - Review fuzzy matches periodically for accuracy

3. **System Workspace:**
   - Configure a dedicated workspace ID after first run
   - Events under system workspace are "unclaimed"
   - Build UI for businesses to claim their events

4. **Geocoding:**
   - Monitor Google Geocoding API quota
   - Cache is 30 days - clear if venues move
   - Provide fallback for failed geocoding

5. **Quality Control:**
   - Review draft events (quality <85) regularly
   - Adjust auto-publish threshold based on accuracy
   - Monitor rejection reasons for patterns

## Future Enhancements

1. **Event Duplicate Detection:**
   - Check for existing events with same date/venue/performer
   - Merge or link duplicate events

2. **Business Claiming:**
   - UI for businesses to claim AI-extracted events
   - Transfer ownership from system workspace

3. **Enhanced Matching:**
   - Use phonetic matching (Soundex, Metaphone)
   - Geographic proximity for venue matching
   - Learn from manual corrections

4. **Image Extraction:**
   - Extract event images from article content
   - Use Unsplash as fallback

5. **Ticketing Integration:**
   - Extract ticketing URLs from articles
   - Link to Eventbrite, Ticketmaster, etc.

6. **Calendar Integration:**
   - Export to Google Calendar, iCal
   - Social media sharing

## Support & Maintenance

### Common Issues

**No events detected:**
- Check AI model availability
- Verify article content has event information
- Lower detection threshold temporarily

**Geocoding failures:**
- Verify Google Maps API key is set
- Check API quota limits
- Review venue names for clarity

**Duplicate venues/performers:**
- Adjust matching threshold
- Manually merge duplicates
- Review similarity algorithm

**Low quality scores:**
- Review AI extraction prompts
- Check for missing data in articles
- Adjust quality calculation weights

## API Reference

See inline PHPDoc documentation in service classes for detailed method signatures and return types.
