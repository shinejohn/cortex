# News Workflow Implementation

## Overview

This document describes the automated news generation workflow for the GoEventCity platform. The system automatically discovers local businesses, collects news, generates articles with AI-powered fact-checking, and publishes them to the Day News section.

## Architecture

The workflow consists of 7 phases that run in sequence:

1. **Business Discovery** (Phase 1) - Monthly
2. **News Collection** (Phase 2) - Daily
3. **Content Shortlisting** (Phase 3) - Daily
4. **Fact-Checking & Outline Generation** (Phase 4) - Daily
5. **Final Article Selection** (Phase 5) - Daily
6. **Article Generation** (Phase 6) - Daily
7. **Auto-Publishing** (Phase 7) - Daily

## Services

### Core Services

#### 1. BusinessDiscoveryService
**File:** `app/Services/News/BusinessDiscoveryService.php`

Discovers local businesses in each region using SERP API.

**Key Method:**
- `discoverBusinesses(Region $region): int` - Discovers businesses for a region

**Configuration:**
```php
'business_discovery' => [
    'enabled' => true,
    'categories' => ['restaurant', 'cafe', 'retail'],
    'businesses_per_region' => 50,
],
```

#### 2. NewsCollectionService
**File:** `app/Services/News/NewsCollectionService.php`

Collects news articles from discovered businesses and general news categories.

**Key Method:**
- `collectNews(Region $region): int` - Collects news for a region

**Features:**
- Content deduplication using SHA-256 hashing
- Configurable article limits per business and category
- Stores articles with metadata for processing

#### 3. ContentCurationService
**File:** `app/Services/News/ContentCurationService.php`

Handles both initial shortlisting (Phase 3) and final article selection (Phase 5).

**Key Methods:**
- `shortlistArticles(Region $region): int` - Scores and shortlists articles
- `finalSelection(Region $region): int` - Evaluates draft quality and selects top articles

**Features:**
- AI-powered relevance scoring
- Topic tag extraction
- Quality evaluation with configurable thresholds

#### 4. FactCheckingService
**File:** `app/Services/News/FactCheckingService.php`

Generates article outlines and fact-checks claims using web scraping.

**Key Method:**
- `processForRegion(Region $region): int` - Processes drafts for fact-checking

**Features:**
- AI-powered outline generation
- Claim extraction and verification
- Multi-source fact-checking with confidence scoring
- Confidence calculation adjusted by source count

**Confidence Scoring:**
- 3+ sources: 100% × (verified/total)
- 2 sources: 80% × (verified/total)
- 1 source: 60% × (verified/total)

#### 5. ArticleGenerationService
**File:** `app/Services/News/ArticleGenerationService.php`

Generates full articles from drafts using AI with verified fact-checks.

**Key Method:**
- `generateArticles(Region $region): int` - Generates articles from drafts

**Features:**
- AI-powered article generation
- SEO metadata generation (slug, meta description, keywords)
- Includes verified fact-checks in content
- Automatic slug generation from titles

#### 6. PublishingService
**File:** `app/Services/News/PublishingService.php`

Publishes articles to DayNewsPost with hybrid auto-publishing.

**Key Method:**
- `publishArticles(Region $region): int` - Publishes articles

**Features:**
- **Hybrid Auto-Publishing:**
  - Quality score ≥ 85: Auto-publish (status = 'published')
  - Quality score < 85: Draft for review (status = 'draft')
- Topic tag to category mapping
- Many-to-many region relationships
- Transaction-based publishing for data integrity

**Category Mapping:**
```php
'local' => 'local_news'
'business' => 'business'
'sports' => 'sports'
// ... etc
```

#### 7. NewsWorkflowService (Orchestrator)
**File:** `app/Services/News/NewsWorkflowService.php`

Orchestrates all phases of the workflow.

**Key Methods:**
- `runCompleteWorkflow(): array` - Runs all 7 phases for all regions
- `runDailyWorkflow(): array` - Runs phases 2-7 for all regions
- `runWorkflowForRegion(Region $region): array` - Runs complete workflow for one region
- `runDailyWorkflowForRegion(Region $region): array` - Runs daily workflow for one region
- `runBusinessDiscovery(): array` - Runs only business discovery for all regions
- `getWorkflowStats(): array` - Returns workflow statistics

**Features:**
- Comprehensive error handling
- Continues processing if one region fails
- Detailed result aggregation
- Extensive logging

### Supporting Services

#### PrismAiService
**File:** `app/Services/News/PrismAiService.php`

Handles all AI interactions using Prism PHP.

**Key Methods:**
- `scoreArticleRelevance()` - Scores article relevance for local news
- `generateOutline()` - Generates structured outlines
- `extractClaims()` - Extracts factual claims
- `evaluateDraftQuality()` - Evaluates draft quality
- `generateFinalArticle()` - Generates final article content

#### SerpApiService
**File:** `app/Services/News/SerpApiService.php`

Integrates with SERP API for business discovery and news search.

**Key Methods:**
- `searchBusinesses()` - Searches for businesses in a region
- `searchNews()` - Searches for news articles

#### ScrapingBeeService
**File:** `app/Services/News/ScrapingBeeService.php`

Handles web scraping for fact-checking using ScrapingBee API.

**Key Method:**
- `searchForClaim()` - Searches and scrapes web sources for claim verification

## Artisan Commands

### 1. news:run-daily
**Description:** Run the daily news workflow (Phases 2-7)

**Usage:**
```bash
# Run for all regions
php artisan news:run-daily

# Run for specific region
php artisan news:run-daily --region=123
```

**Output:**
- Overall metrics (total/successful/failed regions)
- Phase-by-phase results
- Error details for failed regions

### 2. news:discover-businesses
**Description:** Run business discovery (Phase 1 - typically monthly)

**Usage:**
```bash
# Run for all regions
php artisan news:discover-businesses

# Run for specific region
php artisan news:discover-businesses --region=123
```

**Output:**
- Total businesses discovered
- Success/failure metrics per region

### 3. news:stats
**Description:** Display current workflow statistics

**Usage:**
```bash
php artisan news:stats
```

**Output:**
- Total regions
- Pending articles
- Drafts at each stage
- Pipeline health indicators

## Database Models

### NewsArticle
**Table:** `news_articles`

Stores collected news articles before curation.

**Key Fields:**
- `region_id` - Foreign key to regions
- `business_id` - Optional foreign key to businesses
- `source_type` - 'business' or 'category'
- `title`, `url`, `content_snippet`
- `content_hash` - SHA-256 for deduplication
- `processed` - Boolean flag for curation status

### NewsArticleDraft
**Table:** `news_article_drafts`

Stores article drafts through the workflow pipeline.

**Key Fields:**
- `news_article_id` - Source article
- `region_id` - Target region
- `status` - 'shortlisted' | 'ready_for_generation' | 'ready_for_publishing' | 'published' | 'rejected'
- `relevance_score` - AI-generated relevance (0-100)
- `quality_score` - AI-generated quality (0-100)
- `fact_check_confidence` - Average fact-check confidence
- `topic_tags` - Array of topic tags
- `outline` - Markdown outline
- `generated_title`, `generated_content`, `generated_excerpt`
- `seo_metadata` - SEO data (slug, meta description, keywords)
- `published_post_id` - Foreign key to day_news_posts
- `rejection_reason` - If rejected

### NewsFactCheck
**Table:** `news_fact_checks`

Stores fact-check results for claims.

**Key Fields:**
- `draft_id` - Foreign key to drafts
- `claim` - The claim being verified
- `verification_result` - 'verified' | 'unverified' | 'contradicted'
- `confidence_score` - Confidence percentage (0-100)
- `sources` - Array of source URLs
- `scraped_evidence` - Array of scraped evidence with URLs

## Configuration

**File:** `config/news-workflow.php`

```php
return [
    'business_discovery' => [
        'enabled' => true,
        'categories' => ['restaurant', 'cafe', 'retail', 'hotel'],
        'businesses_per_region' => 50,
        'run_interval_days' => 30,
    ],

    'news_collection' => [
        'enabled' => true,
        'articles_per_business' => 3,
        'max_category_articles' => 50,
        'categories' => ['local news', 'community', 'events'],
    ],

    'shortlisting' => [
        'enabled' => true,
        'min_relevance_score' => 70,
        'articles_per_region' => 10,
    ],

    'fact_checking' => [
        'enabled' => true,
        'min_confidence_threshold' => 70,
        'max_claims_per_article' => 5,
    ],

    'final_selection' => [
        'enabled' => true,
        'min_quality_score' => 75,
        'articles_per_region' => 5,
    ],

    'article_generation' => [
        'enabled' => true,
    ],

    'publishing' => [
        'enabled' => true,
        'auto_publish_threshold' => 85,
    ],
];
```

## Scheduling

Add to `routes/console.php`:

```php
use Illuminate\Support\Facades\Schedule;

// Daily workflow at 6:00 AM
Schedule::command('news:run-daily')->dailyAt('06:00');

// Business discovery on 1st of each month at 3:00 AM
Schedule::command('news:discover-businesses')->monthlyOn(1, '03:00');
```

## Testing

All services have comprehensive test coverage:

- **Total Tests:** 66
- **Total Assertions:** 333
- **Test Files:** 7

**Run all tests:**
```bash
php artisan test tests/Feature/Services/NewsWorkflow/
```

**Run specific service tests:**
```bash
php artisan test tests/Feature/Services/NewsWorkflow/ArticleGenerationServiceTest.php
php artisan test tests/Feature/Services/NewsWorkflow/PublishingServiceTest.php
```

## Monitoring

### Logs

All services log to `storage/logs/laravel.log`:

- Info: Workflow start/completion, phase results
- Warning: Low confidence scores, quality threshold failures
- Error: API failures, processing errors

### Statistics

Use the stats command for real-time monitoring:

```bash
php artisan news:stats
```

Provides:
- Pipeline health (drafts in progress)
- Pending articles awaiting curation
- Articles ready to publish
- Total published/rejected counts

## Error Handling

The workflow is designed for resilience:

1. **Region-level isolation:** If one region fails, others continue processing
2. **Draft-level error handling:** Failed drafts are marked as 'rejected' with reason
3. **Service-level validation:** Each service validates configuration and input
4. **Transaction-based publishing:** Database transactions ensure data integrity
5. **Comprehensive logging:** All errors logged with context

## API Dependencies

### Required Services

1. **SERP API** - Business discovery and news search
   - Environment: `SERP_API_KEY`

2. **ScrapingBee** - Web scraping for fact-checking
   - Environment: `SCRAPINGBEE_API_KEY`

3. **Prism AI** - Article generation and evaluation
   - Configured via `config/prism.php`

## Performance Considerations

- **Batch Processing:** Services process articles in batches per region
- **Caching:** Content hash deduplication prevents duplicate processing
- **Lazy Loading:** Relationships loaded only when needed
- **Database Indexing:** Key fields indexed for performance
- **Configurable Limits:** All limits configurable to control API costs

## Future Enhancements

Potential improvements for future iterations:

1. **Image Generation:** Add AI-generated featured images
2. **Multi-language Support:** Generate articles in multiple languages
3. **Sentiment Analysis:** Analyze article sentiment before publishing
4. **User Feedback Loop:** Learn from user engagement metrics
5. **A/B Testing:** Test different headlines and content styles
6. **Real-time Processing:** WebSocket-based real-time workflow updates
7. **Advanced Analytics:** Dashboard for workflow performance metrics

## Support

For issues or questions:
- Check logs: `storage/logs/laravel.log`
- Run stats: `php artisan news:stats`
- Review configuration: `config/news-workflow.php`
- Run tests: `php artisan test tests/Feature/Services/NewsWorkflow/`
