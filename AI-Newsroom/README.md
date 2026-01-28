# AI Newsroom: Complete Build Package

## What This Is

A complete AI-powered newsroom system that:
- Collects content from RSS, email, web scraping, government platforms
- Classifies everything using AI (GPT-4o-mini for speed/cost)
- Routes to appropriate processing tier (brief/standard/full)
- Extracts events automatically
- Tracks business mentions for sales opportunities
- Generates articles appropriate to content type

## Architecture

```
COLLECTION → CLASSIFICATION → PROCESSING → OUTPUT
    ↓              ↓              ↓           ↓
RSS/Email/     GPT-4o-mini    Brief/Std/   Articles
Scrape/Govt     analysis       Full tier    Events
```

## Installation

### 1. Run Migrations
```bash
php artisan migrate
```

### 2. Install Dependencies
```bash
composer require simplepie/simplepie
composer require webklex/php-imap
npm install playwright
npx playwright install chromium
```

### 3. Configure IMAP (for email ingestion)
Add to `config/imap.php`:
```php
'accounts' => [
    'newsroom' => [
        'host' => env('IMAP_HOST'),
        'port' => env('IMAP_PORT', 993),
        'encryption' => 'ssl',
        'username' => env('IMAP_USERNAME'),
        'password' => env('IMAP_PASSWORD'),
    ],
],
```

### 4. Configure Queues
Add to `config/queue.php` connections:
```php
'collection' => ['driver' => 'redis', 'queue' => 'collection', ...],
'classification' => ['driver' => 'redis', 'queue' => 'classification', ...],
'breaking' => ['driver' => 'redis', 'queue' => 'breaking', ...],
'processing-brief' => ['driver' => 'redis', 'queue' => 'processing-brief', ...],
'processing-standard' => ['driver' => 'redis', 'queue' => 'processing-standard', ...],
'processing-full' => ['driver' => 'redis', 'queue' => 'processing-full', ...],
```

### 5. Schedule Jobs
Add to `app/Console/Kernel.php`:
```php
$schedule->command('newsroom:collect')->everyFifteenMinutes();
$schedule->command('newsroom:classify')->everyTenMinutes();
$schedule->command('newsroom:process')->everyFiveMinutes();
```

## Usage

### Run Full Pipeline
```bash
php artisan newsroom:run --sync
```

### Individual Steps
```bash
php artisan newsroom:collect
php artisan newsroom:classify
php artisan newsroom:process
```

### Check Stats
```bash
php artisan newsroom:stats
```

## File Structure

```
database/migrations/
├── 2025_01_22_000001_create_news_sources_table.php
├── 2025_01_22_000002_create_collection_methods_table.php
├── 2025_01_22_000003_create_raw_content_table.php
├── 2025_01_22_000004_create_incoming_emails_table.php
├── 2025_01_22_000005_create_email_sender_mappings_table.php
├── 2025_01_22_000006_create_business_mentions_table.php
├── 2025_01_22_000007_create_sales_opportunities_table.php
└── 2025_01_22_000008_modify_existing_tables.php

app/Models/
├── NewsSource.php
├── CollectionMethod.php
├── RawContent.php
├── IncomingEmail.php
├── EmailSenderMapping.php
├── BusinessMention.php
└── SalesOpportunity.php

app/Services/Newsroom/
├── ContentClassificationService.php  ← THE CORE AI ENGINE
├── RssCollectionService.php
├── WebScrapingService.php
├── BusinessMatchingService.php
└── (add EmailIngestionService, platform collectors as needed)

app/Jobs/Newsroom/
├── ProcessRssCollectionJob.php
├── ProcessWebScrapingJob.php
├── ClassifyRawContentJob.php
├── ProcessContentByTierJob.php
├── DispatchCollectionJob.php
├── DispatchClassificationJob.php
└── DispatchProcessingJob.php

app/Console/Commands/Newsroom/
├── NewsroomCollectCommand.php
├── NewsroomClassifyCommand.php
├── NewsroomProcessCommand.php
├── NewsroomRunCommand.php
└── NewsroomStatsCommand.php
```

## Core Philosophy

**NOTHING GETS DISMISSED**

- A bake sale IS news (it's an event + fundraiser)
- A restaurant opening IS news (it's business news + event)
- Classification = ROUTING, not REJECTION
- Every business mention is valuable (they're potential customers)

## Processing Tiers

| Tier | AI Model | Auto-Publish | Word Count | Use For |
|------|----------|--------------|------------|---------|
| Brief | GPT-4o-mini | Yes | 100-200 | Announcements, calendar items |
| Standard | Claude | Conditional | 300-500 | Most news, business, sports |
| Full | Claude + Editor | No | 500-1000 | Breaking, crime, investigations |

## Integration with Existing Code

### Keep As-Is
- PrismAiService (AI gateway)
- PublishingService
- UnsplashService
- All existing models (DayNewsPost, Business, Event, etc.)

### Modify
- ArticleGenerationService: Add tier-based generation methods
- NewsWorkflowService: Orchestrate new pipeline
- ContentCurationService: Use RawContent scores

### Delete
- NewsCollectionService (SERP-based - the problem we're replacing)
- ScrapingBeeService (replaced by Playwright)

## Adding a New Source

```php
// Create source
$source = NewsSource::create([
    'community_id' => $communityId,
    'name' => 'City of Example',
    'source_type' => NewsSource::TYPE_GOVERNMENT,
    'subtype' => NewsSource::SUBTYPE_CITY,
    'website_url' => 'https://example.gov',
    'is_active' => true,
]);

// Add RSS collection
CollectionMethod::create([
    'source_id' => $source->id,
    'method_type' => CollectionMethod::TYPE_RSS,
    'endpoint_url' => 'https://example.gov/feed.rss',
    'poll_interval_minutes' => 60,
    'is_enabled' => true,
]);
```

## Sales Integration

Every classified item with a business mention can become a sales opportunity:
- New business opening → HOT lead
- Event host → WARM lead
- Positive coverage → Follow-up opportunity

Check `SalesOpportunity` table for leads sorted by quality and priority.
