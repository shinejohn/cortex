# N8N RSS Feed Integration

## Overview

This system allows N8N to manage businesses scraped from Google SERP API, track their RSS feeds, and automatically generate Day News articles from feed content.

## Architecture

### Database Schema

#### 1. Businesses Table
Stores businesses scraped from Google SERP API (Google Local, Google Maps, Google Local Services) with complete information.

**Basic Fields:**
- `google_place_id` - Primary unique identifier from Google (prevents duplicates)
- `name`, `slug`, `description` - Basic business info
- `website`, `phone`, `email` - Contact information
- `address`, `city`, `state`, `postal_code`, `country` - Location
- `latitude`, `longitude` - Geographic coordinates
- `categories` (JSON) - Business categories from Google
- `rating`, `reviews_count` - Google ratings data
- `opening_hours` (JSON) - Structured business hours
- `images` (JSON) - Business photos
- `serp_metadata` (JSON) - Raw SERP API response
- `workspace_id` (nullable) - For claimed businesses
- `claimable_type`, `claimable_id` (nullable) - Links to Venue, Store, Event, etc.
- `status` - active/inactive

**SERP API Enhancement Fields:**

*Multiple Identifiers (for tracking across Google services):*
- `data_id` - Google Maps data ID
- `data_cid` - Google Maps CID
- `lsig` - Google location signature
- `provider_id` - Provider identifier
- `local_services_cid`, `local_services_bid`, `local_services_pid` - Local Services IDs

*Source & Sync Tracking:*
- `serp_source` - Source API: 'local', 'maps', 'local_services'
- `serp_last_synced_at` - Last sync timestamp

*Business Type Classification:*
- `primary_type` - Primary business type (e.g., 'Restaurant', 'Electrician')
- `type_id` - Google type identifier
- `type_ids` (JSON) - Multiple type IDs

*Enhanced Business Info:*
- `price_level` - Price indicator: '$', '$$', '$$$', '$$$$'
- `open_state` - Current status: 'Open', 'Closed', 'Open 24 hours'
- `hours_display` - Human-readable hours string

*Local Services Specific:*
- `google_badge` - Badge status (e.g., 'GOOGLE GUARANTEED')
- `service_area` (JSON) - Geographic service coverage
- `years_in_business` - Business longevity
- `bookings_nearby` - Booking count metric

*Enhanced Verification:*
- `verification_status` - unverified, claimed, verified, google_guaranteed
- `verified_at` - Verification timestamp
- `claimed_at` - Claim timestamp
- `is_verified` (boolean) - Legacy field for backward compatibility

*Service Options & URLs:*
- `service_options` (JSON) - dine_in, takeout, delivery, curbside_pickup, etc.
- `reserve_url` - Reservation link
- `order_online_url` - Online ordering link

**Relationships:**
- Many-to-many with `Region` via `business_region` pivot
- One-to-many with `RssFeed`
- Polymorphic to claimable models (Venue, Store, etc.)

#### 2. RSS Feeds Table
Tracks RSS feeds discovered for each business with health monitoring.

**Key Fields:**
- `business_id` - Parent business
- `url` - Feed URL
- `feed_type` - Type: blog, news, events, articles, podcast, video, other
- `status` - active, inactive, broken, checking
- `health_status` - healthy, degraded, unhealthy
- `last_checked_at`, `last_successful_fetch_at` - Monitoring timestamps
- `last_error` - Error details if feed is broken
- `fetch_frequency` - Minutes between checks
- `auto_approved` - Auto-accept discovered feeds (default: true)

**Relationships:**
- Belongs to `Business`
- One-to-many with `RssFeedItem`
- One-to-many with `DayNewsPost` (articles generated from this feed)

#### 3. RSS Feed Items Table
Individual items from RSS feeds.

**Key Fields:**
- `rss_feed_id` - Parent feed
- `guid` - Unique item identifier (unique per feed)
- `title`, `description`, `content` - Article content
- `url` - Item link
- `author`, `published_at` - Metadata
- `categories` (JSON) - Item categories
- `processed` - Whether N8N has processed this item
- `processed_at` - Processing timestamp

**Relationships:**
- Belongs to `RssFeed`
- One-to-many with `DayNewsPost` (articles generated from this item)

#### 4. Day News Posts (Updated)
Added RSS feed tracking fields.

**New Fields:**
- `rss_feed_id` (nullable) - Source feed
- `rss_feed_item_id` (nullable) - Source feed item
- `source_type` - Source identifier

## API Endpoints

All endpoints are under `/api/n8n/*` and require API key authentication.

### Authentication

All N8N API endpoints require authentication via API key. You can provide the API key in two ways:

**Option 1: X-N8N-API-Key Header (Recommended)**
```http
GET /api/n8n/regions
X-N8N-API-Key: your-api-key-here
```

**Option 2: Authorization Bearer Token**
```http
GET /api/n8n/regions
Authorization: Bearer your-api-key-here
```

**Setup:**
1. Generate a secure API key: `openssl rand -base64 32`
2. Add to your `.env` file: `N8N_API_KEY=your-generated-key`
3. Configure N8N to send the API key in request headers

**Note:** If `N8N_API_KEY` is not set in `.env`, the endpoints will work without authentication (useful for local development only).

### 1. Get Regions
```http
GET /api/n8n/regions
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Chicago",
      "slug": "chicago",
      "type": "city",
      "parent_id": null,
      "latitude": 41.8781,
      "longitude": -87.6298
    }
  ],
  "total": 1
}
```

### 2. Upsert Business
```http
POST /api/n8n/businesses
```

**Request Body:**
```json
{
  "google_place_id": "ChIJtest123",
  "name": "Test Restaurant",
  "description": "A great restaurant",
  "website": "https://example.com",
  "phone": "+1234567890",
  "email": "info@example.com",
  "address": "123 Main St",
  "city": "Chicago",
  "state": "IL",
  "postal_code": "60601",
  "country": "USA",
  "latitude": 41.8781,
  "longitude": -87.6298,
  "categories": ["Restaurant", "American"],
  "rating": 4.5,
  "reviews_count": 100,
  "opening_hours": {
    "Monday": {"open": "09:00", "close": "18:00"}
  },
  "images": ["https://example.com/image.jpg"],
  "serp_metadata": {},
  "region_ids": ["region-uuid-1", "region-uuid-2"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "google_place_id": "ChIJtest123",
    "name": "Test Restaurant",
    "slug": "test-restaurant",
    "regions": [...]
  },
  "message": "Business saved successfully"
}
```

**Notes:**
- Uses `google_place_id` for upsert (prevents duplicates)
- Auto-generates slug from name if not provided
- Attaches to multiple regions via `region_ids` array

### 3. Get Business Feeds
```http
GET /api/n8n/businesses/{businessId}/feeds
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "business_id": "uuid",
      "url": "https://example.com/feed.xml",
      "feed_type": "news",
      "status": "active",
      "health_status": "healthy",
      "last_checked_at": "2025-11-17T10:00:00Z"
    }
  ],
  "total": 1
}
```

### 4. Upsert RSS Feed
```http
POST /api/n8n/feeds
```

**Request Body:**
```json
{
  "business_id": "uuid",
  "url": "https://example.com/feed.xml",
  "feed_type": "news",
  "title": "Example News Feed",
  "description": "Latest news",
  "metadata": {}
}
```

**Feed Types:**
- `blog`
- `news`
- `events`
- `articles`
- `podcast`
- `video`
- `other`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "business_id": "uuid",
    "url": "https://example.com/feed.xml",
    "feed_type": "news",
    "status": "active",
    "health_status": "healthy"
  },
  "message": "Feed saved successfully"
}
```

**Notes:**
- Uses `business_id` + `url` for upsert
- Defaults to `auto_approved: true`

### 5. Get All Feeds
```http
GET /api/n8n/feeds?health_status=healthy&feed_type=news
```

**Query Parameters:**
- `health_status` (optional) - Filter by: healthy, degraded, unhealthy
- `feed_type` (optional) - Filter by feed type

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "business": {
        "id": "uuid",
        "name": "Test Business"
      },
      "url": "https://example.com/feed.xml",
      "health_status": "healthy"
    }
  ],
  "total": 1
}
```

### 6. Update Feed Health
```http
PATCH /api/n8n/feeds/{feedId}/health
```

**Request Body:**
```json
{
  "health_status": "healthy",
  "last_error": null,
  "status": "active"
}
```

**Health Status Values:**
- `healthy` - Feed working perfectly (clears `last_error`, sets `last_successful_fetch_at`)
- `degraded` - Feed having intermittent issues
- `unhealthy` - Feed consistently failing

**Status Values:**
- `active` - Feed is active
- `inactive` - Feed manually disabled
- `broken` - Feed permanently broken

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "health_status": "healthy",
    "last_successful_fetch_at": "2025-11-17T10:00:00Z",
    "last_error": null
  },
  "message": "Feed health updated successfully"
}
```

### 7. Publish Article
```http
POST /api/n8n/articles
```

**Request Body:**
```json
{
  "workspace_id": "uuid",
  "author_id": "uuid",
  "rss_feed_id": "uuid",
  "rss_feed_item_id": "uuid",
  "source_type": "rss_feed",
  "title": "Breaking News Story",
  "content": "Full article content...",
  "excerpt": "Short excerpt",
  "featured_image": "https://example.com/image.jpg",
  "category": "Local News",
  "type": "news",
  "metadata": {},
  "region_ids": ["region-uuid-1"],
  "status": "draft",
  "published_at": "2025-11-17T10:00:00Z"
}
```

**Status Values:**
- `draft` - Article not yet published (no `published_at` set)
- `published` - Article published (auto-sets `published_at` if not provided)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Breaking News Story",
    "slug": "breaking-news-story",
    "status": "draft",
    "published_at": null,
    "regions": [...],
    "rssFeed": {...},
    "rssFeedItem": {...}
  },
  "message": "Article published successfully"
}
```

**Notes:**
- Auto-generates slug from title
- Marks `rss_feed_item` as processed
- Attaches to multiple regions
- Default status is `draft` for review workflow

### 8. Update Article Status
```http
PATCH /api/n8n/articles/{articleId}/status
```

**Request Body:**
```json
{
  "status": "published",
  "published_at": "2025-11-17T10:00:00Z"
}
```

**Status Values:**
- `draft` - Move article back to draft (clears `published_at`)
- `published` - Publish article (auto-sets `published_at` if not provided)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Breaking News Story",
    "slug": "breaking-news-story",
    "status": "published",
    "published_at": "2025-11-17T10:00:00Z",
    "regions": [...],
    "rssFeed": {...},
    "rssFeedItem": {...}
  },
  "message": "Article status updated successfully"
}
```

**Notes:**
- Used by N8N review workflow to publish approved articles
- When changing to `published`, automatically sets `published_at` if not provided
- When changing to `draft`, automatically clears `published_at`

## N8N Workflow Integration

### N8N Configuration

Before creating workflows, configure authentication in N8N:

1. **HTTP Request Node Settings:**
   - Add to **every** HTTP Request node that calls the Laravel API
   - Under "Headers" → Click "Add Header"
   - Name: `X-N8N-API-Key`
   - Value: Your API key from `N8N_API_KEY` in `.env`

2. **Using Credentials (Recommended):**
   - Create a "Generic Credential" in N8N
   - Set Header Name: `X-N8N-API-Key`
   - Set Header Value: Your API key
   - Reference this credential in all HTTP Request nodes

3. **Example HTTP Request Node:**
   ```json
   {
     "method": "GET",
     "url": "https://your-domain.com/api/n8n/regions",
     "authentication": "genericCredentialType",
     "headers": {
       "X-N8N-API-Key": "={{$credentials.apiKey}}"
     }
   }
   ```

### Recommended Workflow Steps

#### 1. Scrape Businesses (Daily/Weekly)
```
HTTP Request Node → SERP API
  ↓
Process Results
  ↓
Loop Through Results
  ↓
POST /api/n8n/businesses (for each result)
```

**Example N8N HTTP Node Config:**
- Method: POST
- URL: `https://your-domain.com/api/n8n/businesses`
- Body: JSON with business data from SERP API

#### 2. Discover RSS Feeds (After Business Creation)
```
Get Business Website
  ↓
Firecrawl/RSS Discovery Tool
  ↓
Loop Through Discovered Feeds
  ↓
POST /api/n8n/feeds (for each feed)
```

#### 3. Monitor Feed Health (Hourly)
```
GET /api/n8n/feeds
  ↓
Try to Fetch Each Feed
  ↓
PATCH /api/n8n/feeds/{id}/health (update status)
```

**Health Update Logic:**
```javascript
// If fetch successful
{
  "health_status": "healthy"
}

// If fetch failed once
{
  "health_status": "degraded",
  "last_error": "Connection timeout"
}

// If fetch failed 3+ times
{
  "health_status": "unhealthy",
  "status": "broken",
  "last_error": "Feed permanently unavailable"
}
```

#### 4. Generate Articles (Hourly/Daily)
```
GET /api/n8n/feeds?health_status=healthy
  ↓
Fetch New Items from Each Feed
  ↓
Filter Relevant Items
  ↓
Send to AI for Article Generation (Firecrawl)
  ↓
POST /api/n8n/articles (save as draft, status: "draft")
  ↓
Articles pushed to DB in draft mode
```

#### 5. Review and Publish Workflow (Separate N8N Workflow)
```
Get Draft Articles from Database
  ↓
Editor Reviews Articles (Manual Step or Automated Check)
  ↓
If Approved:
  ↓
PATCH /api/n8n/articles/{id}/status (status: "published")
  ↓
Article is now live
```

**Article Review Workflow:**
- All generated articles are initially saved with `status: "draft"`
- Articles remain in draft mode until manually reviewed and approved
- N8N review workflow can fetch draft articles and present them for review
- Once approved, use `PATCH /api/n8n/articles/{id}/status` to publish
- The endpoint automatically sets `published_at` when changing status to published
- Can also move articles back to draft if needed

## Model Usage Examples

### PHP/Laravel

#### Create a Business
```php
use App\Models\Business;
use App\Models\Region;

$business = Business::create([
    'google_place_id' => 'ChIJtest123',
    'name' => 'Test Restaurant',
    'slug' => 'test-restaurant',
    'categories' => ['Restaurant', 'American'],
    'rating' => 4.5,
]);

// Attach to regions
$regions = Region::whereIn('id', $regionIds)->get();
$business->regions()->sync($regions);
```

#### Query Businesses
```php
// Get all businesses in a region
$businesses = Business::inRegion($regionId)
    ->active()
    ->verified()
    ->get();

// Get businesses with healthy feeds
$businesses = Business::withHealthyFeeds()->get();

// Get businesses within radius
$businesses = Business::withinRadius(41.8781, -87.6298, 10)->get();
```

#### Manage RSS Feeds
```php
use App\Models\RssFeed;

// Create feed
$feed = RssFeed::create([
    'business_id' => $business->id,
    'url' => 'https://example.com/feed.xml',
    'feed_type' => 'news',
]);

// Update health
$feed->markAsHealthy();
$feed->markAsDegraded('Slow response');
$feed->markAsUnhealthy('Connection refused');
$feed->markAsBroken('Feed removed');

// Query feeds
$healthyFeeds = RssFeed::active()->healthy()->get();
$feedsNeedingCheck = RssFeed::needingCheck()->get();
```

#### Track Feed Items
```php
use App\Models\RssFeedItem;

// Create item
$item = RssFeedItem::create([
    'rss_feed_id' => $feed->id,
    'guid' => 'unique-item-id',
    'title' => 'Article Title',
    'content' => 'Full content...',
    'published_at' => now(),
]);

// Mark as processed
$item->markAsProcessed();

// Query unprocessed items
$unprocessed = RssFeedItem::unprocessed()->recent(7)->get();
```

## Database Indexes

Optimized indexes for common queries:

**businesses:**
- `google_place_id` (unique, prevents duplicates)
- `workspace_id` (for claimed businesses)
- `status` (for filtering active/inactive)
- `is_verified` (for filtering verified)
- `latitude, longitude` (composite, for geographic queries)

**rss_feeds:**
- `business_id, url` (composite, for upsert)
- `status` (for filtering active feeds)
- `health_status` (for filtering healthy feeds)
- `feed_type` (for filtering by type)

**rss_feed_items:**
- `rss_feed_id, guid` (composite unique, prevents item duplicates)
- `processed` (for finding unprocessed items)
- `published_at` (for finding recent items)

## Security Considerations

1. **API Authentication**: ✅ All N8N endpoints are protected with API key authentication
   - API keys are verified using timing-safe comparison (`hash_equals`)
   - Keys are stored in environment variables (`N8N_API_KEY`)
   - Support for both custom header (`X-N8N-API-Key`) and standard Bearer token
   - Automatically allows requests when no key is configured (development mode)

2. **Rate Limiting**: Consider adding rate limiting to prevent abuse:
   ```php
   // In routes/web.php
   Route::prefix('api/n8n')
       ->middleware(['n8n.api', 'throttle:60,1'])
       ->group(function () {
           // N8N routes
       });
   ```

3. **CSRF Protection**: CSRF validation is disabled for `/api/n8n/*` routes to allow webhook integration.

4. **Validation**: All endpoints include comprehensive validation to prevent invalid data.

5. **Soft Deletes**: All models use soft deletes for data recovery.

6. **Best Practices**:
   - Generate strong API keys: `openssl rand -base64 32`
   - Never commit API keys to version control
   - Rotate API keys periodically
   - Use HTTPS in production to protect API keys in transit
   - Monitor failed authentication attempts

## Monitoring & Maintenance

### Health Monitoring
- Monitor `health_status` field in `rss_feeds` table
- Set up alerts for feeds marked as `unhealthy` or `broken`
- Review `last_error` field for debugging

### Performance
- Use `withHealthyFeeds()` scope to eager load only healthy feeds
- Index on `google_place_id` prevents duplicate businesses
- Composite indexes optimize common query patterns

### Data Cleanup
```php
// Find stale feed items (older than 90 days, processed)
RssFeedItem::processed()
    ->where('created_at', '<', now()->subDays(90))
    ->delete();

// Find broken feeds (unhealthy for 30+ days)
RssFeed::unhealthy()
    ->where('last_successful_fetch_at', '<', now()->subDays(30))
    ->update(['status' => 'broken']);
```

## Testing

Comprehensive test suite included in `tests/Feature/N8nIntegrationTest.php`:

```bash
# Run all N8N integration tests
php artisan test --filter=N8nIntegration

# Run specific test group
php artisan test --filter="Business API"
```

**Test Coverage:**
- ✅ Region retrieval
- ✅ Business creation and updates
- ✅ Business validation
- ✅ Multi-region attachment
- ✅ RSS feed creation and updates
- ✅ Feed type validation
- ✅ Feed health monitoring
- ✅ Article publishing (13/17 tests passing)

## Troubleshooting

### Common Issues

**1. Duplicate Businesses**
- Solution: Always use `google_place_id` for upserts
- The API automatically prevents duplicates

**2. Feed Health Issues**
- Check `last_error` field for details
- Use PATCH `/api/n8n/feeds/{id}/health` to update status
- Monitor `last_checked_at` to ensure feeds are being monitored

**3. Article Publishing Errors**
- Ensure `workspace_id` and `author_id` exist
- Verify `region_ids` are valid
- Check that `rss_feed_id` and `rss_feed_item_id` exist if provided

**4. Missing Relationships**
- Use eager loading: `->load('regions', 'rssFeed', 'rssFeedItem')`
- Check foreign key constraints in migrations

## Future Enhancements

Potential improvements for future development:

1. **Webhook Support**: Add webhook notifications when feeds break
2. **Feed Analytics**: Track article generation success rates
3. **Auto-categorization**: ML-based feed type detection
4. **Feed Prioritization**: Rank feeds by article quality
5. **Duplicate Detection**: Detect duplicate articles across feeds
6. **Content Extraction**: Improve content parsing from feeds
7. **Image Processing**: Auto-optimize and cache feed images
8. **Geo-targeting**: Smart region assignment based on business location
