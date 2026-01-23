# Complete News Workflow File Documentation

## Overview

This document provides a comprehensive breakdown of every file in the news workflow system, explaining what each file does, its key methods, and how it fits into the overall architecture. This documentation is designed to help AI systems analyze the current implementation and compare it against desired outcomes.

## Table of Contents

1. [Services](#services)
2. [Models](#models)
3. [Jobs](#jobs)
4. [Commands](#commands)
5. [Controllers](#controllers)
6. [Configuration](#configuration)
7. [Routes](#routes)
8. [Workflow Phases](#workflow-phases)

---

## Services

### Core Workflow Services

#### 1. NewsWorkflowService
**File**: `app/Services/News/NewsWorkflowService.php`
**Purpose**: Main orchestrator service that coordinates all 7 phases of the news workflow
**Key Methods**:
- `runCompleteWorkflow()`: Runs workflow for all regions
- `runWorkflowForRegion(Region $region)`: Runs all phases for a specific region
- Coordinates calls to: BusinessDiscoveryService, NewsCollectionService, ContentCurationService, FactCheckingService, ArticleGenerationService, PublishingService

**Dependencies**: All phase services
**Status**: Active orchestrator

---

#### 2. BusinessDiscoveryService
**File**: `app/Services/News/BusinessDiscoveryService.php`
**Purpose**: Phase 1 - Discovers local businesses using Google Places API
**Key Methods**:
- `discoverBusinesses(Region $region)`: Main entry point for business discovery
- `discoverForRegion(Region $region)`: Alias for discoverBusinesses
- `upsertBusiness(array $data, Region $region)`: Creates or updates business records
- `assignToRegion(Business $business, Region $region)`: Links business to region (many-to-many)

**Dependencies**: GooglePlacesService
**Data Stored**: Business model with fields: name, address, city, state, postal_code, latitude, longitude, rating, reviews_count, phone, website, categories, primary_type, price_level, images, google_place_id
**Status**: ✅ Updated to use Google Places API

---

#### 3. GooglePlacesService
**File**: `app/Services/News/GooglePlacesService.php`
**Purpose**: Interacts with Google Places API for business discovery and photo management
**Key Methods**:
- `discoverBusinessesForCategory(Region $region, string $category)`: Discovers businesses for a single category
- `parseBusinessData(array $place)`: Parses Google Places API response into standardized format
- `fetchAndStorePhotos(array $photos, string $placeId)`: Fetches and stores business photos
- `extractAddressComponent(array $addressComponents, string $type)`: Extracts city, state, postal code
- `mapPriceLevel(?string $priceLevel)`: Converts Google price level to symbol format ($, $$, $$$, $$$$)

**API Used**: Google Places API (Nearby Search, Photo API)
**Storage**: Photos stored in `business-photos/YYYY/MM/place-id-index.jpg` with CDN proxy URLs
**Status**: ✅ New service (replaces SERP API for business discovery)

---

#### 4. SerpApiService
**File**: `app/Services/News/SerpApiService.php`
**Purpose**: Fetches news articles from SERP API (Google News search)
**Key Methods**:
- `discoverBusinesses(Region $region, array $categories)`: ⚠️ DEPRECATED - Use GooglePlacesService
- `discoverBusinessesForCategory(Region $region, string $category)`: ⚠️ DEPRECATED - Use GooglePlacesService
- `fetchNewsForBusiness(Business $business)`: Fetches news articles about a specific business
- `fetchCategoryNews(Region $region, string $category)`: Fetches general category news for a region
- `geocodeLocation(string $query)`: Geocodes location strings to coordinates
- `buildRegionalQuery(Region $region, string $searchTerms, string $stateAbbr)`: Builds regional queries with state disambiguation
- `parseBusinessData(array $result)`: Parses SERP API business results
- `parseNewsData(array $result, ?Business $business)`: Parses SERP API news results

**API Used**: SERP API (Google News, Google Maps)
**Status**: ✅ Still used for news fetching, deprecated for business discovery

---

#### 5. NewsCollectionService
**File**: `app/Services/News/NewsCollectionService.php`
**Purpose**: Phase 2 - Collects news articles from businesses and categories
**Key Methods**:
- `collectForRegion(Region $region)`: Main entry point - dispatches jobs for parallel processing
- `dispatchBusinessNewsJobs(Region $region)`: Dispatches jobs for business-specific news
- `fetchCategoryNews(Region $region)`: Fetches category news synchronously
- `storeArticle(array $data, Region $region)`: Stores news article with deduplication
- `isDuplicate(string $contentHash, Region $region)`: Checks for duplicate articles

**Dependencies**: SerpApiService
**Data Stored**: NewsArticle model
**Status**: ✅ Active - uses job-based parallel processing

---

#### 6. ContentShortlistingService
**File**: `app/Services/News/ContentShortlistingService.php`
**Purpose**: Phase 3 - Initial shortlisting of newsworthy articles (currently empty placeholder)
**Key Methods**: None (empty class)
**Status**: ⚠️ Placeholder - functionality may be in ContentCurationService

---

#### 7. ContentCurationService
**File**: `app/Services/News/ContentCurationService.php`
**Purpose**: Handles Phase 3 (shortlisting) and Phase 5 (final selection) content curation
**Key Methods**:
- `shortlistArticles(Region $region)`: Phase 3 - Scores and shortlists articles
- `finalSelection(Region $region)`: Phase 5 - Evaluates draft quality and selects top articles
- `scoreArticle(NewsArticle $article, Region $region)`: Scores article relevance
- `selectTopArticles(Region $region, int $count)`: Selects top-scoring articles

**Dependencies**: PrismAiService
**Status**: ✅ Active - handles both shortlisting and final selection

---

#### 8. FactCheckingService
**File**: `app/Services/News/FactCheckingService.php`
**Purpose**: Phase 4 - Generates outlines and fact-checks claims
**Key Methods**:
- `processSingleDraft(NewsArticleDraft $draft)`: Processes a single draft through fact-checking
- `generateOutline(NewsArticleDraft $draft)`: Generates article outline using AI
- `extractClaims(NewsArticleDraft $draft, string $outline)`: Extracts factual claims from outline
- `verifyClaim(NewsArticleDraft $draft, string $claim, array $claimData)`: Verifies a single claim
- `scrapeAndVerify(string $url, string $claim)`: Uses ScrapingBee to scrape and verify claims

**Dependencies**: PrismAiService, ScrapingBeeService
**Data Stored**: NewsFactCheck model, updates NewsArticleDraft with outline
**Status**: ✅ Active - generates outlines and fact-checks claims

---

#### 9. ArticleGenerationService
**File**: `app/Services/News/ArticleGenerationService.php`
**Purpose**: Phase 6 - Generates full article content from drafts
**Key Methods**:
- `generateArticles(Region $region)`: Generates articles for all ready drafts
- `generateArticle(NewsArticleDraft $draft)`: Generates full article content for a single draft
- `assignWriterAgent(NewsArticleDraft $draft)`: Assigns a writer agent to the article
- `fetchFeaturedImage(string $title, Region $region)`: Fetches featured image from Unsplash

**Dependencies**: PrismAiService, UnsplashService, AgentAssignmentService
**Data Stored**: Updates NewsArticleDraft with generated_content, generated_title, generated_excerpt, seo_metadata, featured_image_url
**Status**: ✅ Active - generates full articles with SEO metadata and images

---

#### 10. PublishingService
**File**: `app/Services/News/PublishingService.php`
**Purpose**: Phase 7 - Publishes articles to DayNewsPost
**Key Methods**:
- `publishArticles(Region $region)`: Publishes all ready drafts
- `shouldAutoPublish(NewsArticleDraft $draft)`: Determines if draft meets auto-publish threshold
- `publishDraft(NewsArticleDraft $draft, string $status)`: Creates DayNewsPost from draft
- `mapTopicTagsToCategory(array $topicTags)`: Maps topic tags to DayNewsPost categories

**Dependencies**: AgentAssignmentService
**Data Stored**: Creates DayNewsPost, updates NewsArticleDraft with published_post_id
**Status**: ✅ Active - hybrid auto-publish/draft system

---

### Supporting Services

#### 11. PrismAiService
**File**: `app/Services/News/PrismAiService.php`
**Purpose**: Wrapper for Prism AI (OpenRouter) API calls
**Key Methods**:
- `scoreRelevance(NewsArticle $article, Region $region)`: Scores article relevance
- `generateOutline(NewsArticleDraft $draft)`: Generates article outline
- `extractClaims(string $outline)`: Extracts factual claims
- `verifyClaim(string $claim, string $context)`: Verifies a claim
- `evaluateQuality(NewsArticleDraft $draft)`: Evaluates draft quality
- `generateArticle(NewsArticleDraft $draft)`: Generates full article
- `detectEvent(NewsArticle $article, Region $region)`: Detects if article contains event
- `extractEvent(NewsArticle $article, Region $region)`: Extracts event details
- `analyzeTrust(NewsArticleDraft $draft)`: Analyzes article trustworthiness

**API Used**: OpenRouter (Prism PHP)
**Status**: ✅ Active - handles all AI operations

---

#### 12. ScrapingBeeService
**File**: `app/Services/News/ScrapingBeeService.php`
**Purpose**: Web scraping service for fact-checking verification
**Key Methods**:
- `scrape(string $url)`: Scrapes a URL and returns content
- `extractText(string $html)`: Extracts text content from HTML

**API Used**: ScrapingBee API
**Status**: ✅ Active - used for fact-checking

---

#### 13. UnsplashService
**File**: `app/Services/News/UnsplashService.php`
**Purpose**: Fetches and stores featured images from Unsplash
**Key Methods**:
- `searchImage(string $query, string $orientation)`: Searches Unsplash for images
- `downloadAndStore(string $imageUrl, string $filename)`: Downloads and stores image
- `getFeaturedImage(string $title, Region $region)`: Gets featured image for article

**API Used**: Unsplash API
**Storage**: Images stored in `unsplash/` directory
**Status**: ✅ Active - provides featured images for articles

---

#### 14. ImageStorageService
**File**: `app/Services/News/ImageStorageService.php`
**Purpose**: Manages image storage and retrieval
**Key Methods**:
- `storeImage(string $url, string $path)`: Stores image from URL
- `getImageUrl(string $path)`: Gets public URL for stored image

**Status**: ✅ Active - handles image storage operations

---

#### 15. EventExtractionService
**File**: `app/Services/News/EventExtractionService.php`
**Purpose**: Extracts events from news articles (parallel pipeline)
**Key Methods**:
- `extractEventsForRegion(Region $region)`: Main entry point for event extraction
- `detectEvents(Region $region)`: Detects articles containing events
- `extractEventDetails(EventExtractionDraft $draft)`: Extracts structured event data
- `validateAndPublish(EventExtractionDraft $draft)`: Validates and publishes events

**Dependencies**: PrismAiService, VenueMatchingService, PerformerMatchingService, EventPublishingService
**Data Stored**: EventExtractionDraft, Event models
**Status**: ✅ Active - parallel pipeline to news workflow

---

#### 16. EventPublishingService
**File**: `app/Services/News/EventPublishingService.php`
**Purpose**: Publishes extracted events to Event model
**Key Methods**:
- `publishEvent(EventExtractionDraft $draft)`: Publishes event from draft
- `createEventFromDraft(EventExtractionDraft $draft)`: Creates Event model from draft

**Status**: ✅ Active - publishes events

---

#### 17. VenueMatchingService
**File**: `app/Services/News/VenueMatchingService.php`
**Purpose**: Matches extracted venue names to existing Venue records
**Key Methods**:
- `matchVenue(string $venueName, Region $region)`: Matches venue by name similarity

**Status**: ✅ Active - matches venues for events

---

#### 18. PerformerMatchingService
**File**: `app/Services/News/PerformerMatchingService.php`
**Purpose**: Matches extracted performer names to existing Performer records
**Key Methods**:
- `matchPerformer(string $performerName, Region $region)`: Matches performer by name similarity

**Status**: ✅ Active - matches performers for events

---

#### 19. FetchFrequencyService
**File**: `app/Services/News/FetchFrequencyService.php`
**Purpose**: Manages fetch frequencies for business categories
**Key Methods**:
- `shouldFetch(string $category, Region $region)`: Determines if category should be fetched
- `getLastFetchDate(string $category, Region $region)`: Gets last fetch date
- `updateFetchDate(string $category, Region $region)`: Updates fetch date

**Status**: ✅ Active - manages category fetch frequencies

---

#### 20. WorkflowSettingsService
**File**: `app/Services/News/WorkflowSettingsService.php`
**Purpose**: Manages workflow settings and phase toggles
**Key Methods**:
- `getSettings(Region $region)`: Gets workflow settings for region
- `updateSettings(Region $region, array $settings)`: Updates workflow settings
- `isPhaseEnabled(string $phase, Region $region)`: Checks if phase is enabled

**Status**: ✅ Active - manages workflow configuration

---

## Models

### 1. NewsArticle
**File**: `app/Models/NewsArticle.php`
**Purpose**: Represents raw collected news articles (Phase 2 output)
**Key Fields**:
- `region_id`, `business_id`: Relationships
- `source_type`: 'business' or 'category'
- `source_name`: Name of source
- `title`, `url`, `content_snippet`, `full_content`: Article content
- `source_publisher`: Publisher name
- `published_at`: Publication date
- `metadata`: Raw API response data
- `content_hash`: SHA-256 hash for deduplication
- `processed`: Boolean flag
- `relevance_score`, `relevance_topic_tags`, `relevance_rationale`: Phase 3 scoring
- `scored_at`: Scoring timestamp

**Relationships**:
- `region()`: BelongsTo Region
- `business()`: BelongsTo Business
- `drafts()`: HasMany NewsArticleDraft
- `eventExtractionDrafts()`: HasMany EventExtractionDraft

**Scopes**: `unprocessed()`, `processed()`, `forRegion()`, `forBusiness()`, `bySourceType()`
**Status**: ✅ Active - stores raw collected news

---

### 2. NewsArticleDraft
**File**: `app/Models/NewsArticleDraft.php`
**Purpose**: Represents article drafts through workflow phases (Phase 3-7)
**Key Fields**:
- `news_article_id`: Link to source NewsArticle
- `region_id`: Region relationship
- `status`: Workflow status (shortlisted, outline_generated, ready_for_generation, selected_for_generation, ready_for_publishing, published, rejected)
- `relevance_score`: Phase 3 score
- `quality_score`: Phase 5 score
- `fact_check_confidence`: Phase 4 confidence
- `topic_tags`: Array of topic tags
- `outline`: Phase 4 generated outline
- `generated_title`, `generated_content`, `generated_excerpt`: Phase 6 generated content
- `seo_metadata`: SEO metadata (meta description, keywords)
- `featured_image_url`, `featured_image_path`, `featured_image_disk`: Featured image info
- `ai_metadata`: Additional AI metadata (writer_agent_id, etc.)
- `published_post_id`: Link to published DayNewsPost
- `rejection_reason`: Reason if rejected

**Relationships**:
- `newsArticle()`: BelongsTo NewsArticle
- `region()`: BelongsTo Region
- `publishedPost()`: BelongsTo DayNewsPost
- `factChecks()`: HasMany NewsFactCheck

**Scopes**: `byStatus()`, `shortlisted()`, `outlineGenerated()`, `readyForGeneration()`, `readyForPublishing()`
**Status**: ✅ Active - tracks drafts through workflow

---

### 3. NewsFactCheck
**File**: `app/Models/NewsFactCheck.php`
**Purpose**: Stores fact-check results for claims
**Key Fields**:
- `draft_id`: Link to NewsArticleDraft
- `claim`: The claim being verified
- `result`: Verification result (verified, plausible, unverified, disputed)
- `confidence_score`: Confidence level (0-100)
- `rationale`: Explanation
- `sources`: Array of verification sources
- `verified_at`: Verification timestamp

**Relationships**:
- `draft()`: BelongsTo NewsArticleDraft

**Status**: ✅ Active - stores fact-check results

---

### 4. NewsWorkflowRun
**File**: `app/Models/NewsWorkflowRun.php`
**Purpose**: Tracks workflow execution runs
**Key Fields**:
- `region_id`: Region relationship
- `phase`: Phase number (1-7)
- `status`: Run status (running, completed, failed)
- `articles_processed`: Count of articles processed
- `articles_created`: Count of articles created
- `started_at`, `completed_at`: Timestamps
- `error_message`: Error if failed
- `metadata`: Additional run metadata

**Relationships**:
- `region()`: BelongsTo Region

**Status**: ✅ Active - tracks workflow execution

---

### 5. NewsWorkflowSetting
**File**: `app/Models/NewsWorkflowSetting.php`
**Purpose**: Stores workflow settings per region
**Key Fields**:
- `region_id`: Region relationship
- `phase_enabled`: JSON object with phase enable/disable flags
- `thresholds`: JSON object with phase thresholds
- `settings`: Additional settings JSON

**Relationships**:
- `region()`: BelongsTo Region

**Status**: ✅ Active - manages workflow configuration

---

### 6. NewsFetchFrequency
**File**: `app/Models/NewsFetchFrequency.php`
**Purpose**: Tracks fetch frequencies for categories
**Key Fields**:
- `region_id`: Region relationship
- `category`: Category name
- `frequency`: Fetch frequency (daily, weekly, monthly, custom_days)
- `last_fetched_at`: Last fetch timestamp
- `next_fetch_at`: Next fetch timestamp

**Relationships**:
- `region()`: BelongsTo Region

**Status**: ✅ Active - manages fetch frequencies

---

### 7. NewsletterSubscription
**File**: `app/Models/NewsletterSubscription.php`
**Purpose**: Manages newsletter subscriptions
**Key Fields**:
- `user_id`: User relationship
- `email`: Email address
- `region_id`: Region relationship
- `status`: Subscription status
- `preferences`: Subscription preferences JSON

**Status**: ✅ Active - manages newsletter subscriptions

---

## Jobs

### Orchestrator Jobs

#### 1. ProcessRegionDailyWorkflowJob
**File**: `app/Jobs/News/ProcessRegionDailyWorkflowJob.php`
**Purpose**: Orchestrates daily workflow (dispatches Phase 2)
**Dispatches**: ProcessPhase2NewsCollectionJob
**Status**: ✅ Active - scheduled daily at 6:00 AM UTC

---

### Phase Jobs

#### 2. ProcessPhase2NewsCollectionJob
**File**: `app/Jobs/News/ProcessPhase2NewsCollectionJob.php`
**Purpose**: Phase 2 - Collects news articles
**Dispatches**: ProcessBusinessNewsCollectionJob (per business), ProcessCategoryNewsCollectionJob (per category)
**Chains**: ProcessPhase3ShortlistingJob
**Status**: ✅ Active

---

#### 3. ProcessBusinessNewsCollectionJob
**File**: `app/Jobs/News/ProcessBusinessNewsCollectionJob.php`
**Purpose**: Collects news for a single business
**Status**: ✅ Active - parallel processing

---

#### 4. ProcessCategoryNewsCollectionJob
**File**: `app/Jobs/News/ProcessCategoryNewsCollectionJob.php`
**Purpose**: Collects news for a single category
**Status**: ✅ Active - parallel processing

---

#### 5. ProcessPhase3ShortlistingJob
**File**: `app/Jobs/News/ProcessPhase3ShortlistingJob.php`
**Purpose**: Phase 3 - Shortlists articles
**Dispatches**: ProcessSingleArticleScoringJob (per article)
**Chains**: ProcessPhase4FactCheckingJob
**Status**: ✅ Active

---

#### 6. ProcessSingleArticleScoringJob
**File**: `app/Jobs/News/ProcessSingleArticleScoringJob.php`
**Purpose**: Scores a single article for relevance
**Status**: ✅ Active - parallel processing

---

#### 7. ProcessPhase4FactCheckingJob
**File**: `app/Jobs/News/ProcessPhase4FactCheckingJob.php`
**Purpose**: Phase 4 - Fact-checks drafts
**Dispatches**: ProcessSingleDraftFactCheckingJob (per draft)
**Chains**: ProcessPhase5FinalSelectionJob
**Status**: ✅ Active

---

#### 8. ProcessSingleDraftFactCheckingJob
**File**: `app/Jobs/News/ProcessSingleDraftFactCheckingJob.php`
**Purpose**: Fact-checks a single draft
**Status**: ✅ Active - parallel processing

---

#### 9. ProcessPhase5FinalSelectionJob
**File**: `app/Jobs/News/ProcessPhase5FinalSelectionJob.php`
**Purpose**: Phase 5 - Final article selection
**Dispatches**: ProcessSingleDraftEvaluationJob (per draft)
**Chains**: ProcessPhase6GenerationJob
**Status**: ✅ Active

---

#### 10. ProcessSingleDraftEvaluationJob
**File**: `app/Jobs/News/ProcessSingleDraftEvaluationJob.php`
**Purpose**: Evaluates quality of a single draft
**Status**: ✅ Active - parallel processing

---

#### 11. ProcessPhase6GenerationJob
**File**: `app/Jobs/News/ProcessPhase6GenerationJob.php`
**Purpose**: Phase 6 - Generates articles
**Dispatches**: ProcessSingleArticleGenerationJob (per draft)
**Chains**: ProcessPhase7PublishingJob
**Status**: ✅ Active

---

#### 12. ProcessSingleArticleGenerationJob
**File**: `app/Jobs/News/ProcessSingleArticleGenerationJob.php`
**Purpose**: Generates article for a single draft
**Status**: ✅ Active - parallel processing

---

#### 13. ProcessPhase7PublishingJob
**File**: `app/Jobs/News/ProcessPhase7PublishingJob.php`
**Purpose**: Phase 7 - Publishes articles
**Status**: ✅ Active

---

### Business Discovery Jobs

#### 14. ProcessRegionBusinessDiscoveryJob
**File**: `app/Jobs/News/ProcessRegionBusinessDiscoveryJob.php`
**Purpose**: Discovers businesses for a region
**Dispatches**: ProcessSingleCategoryBusinessDiscoveryJob (per category)
**Status**: ✅ Active - scheduled monthly

---

#### 15. ProcessSingleCategoryBusinessDiscoveryJob
**File**: `app/Jobs/News/ProcessSingleCategoryBusinessDiscoveryJob.php`
**Purpose**: Discovers businesses for a single category
**Status**: ✅ Active - parallel processing

---

### Event Extraction Jobs

#### 16. ProcessEventExtractionJob
**File**: `app/Jobs/News/ProcessEventExtractionJob.php`
**Purpose**: Extracts events from news articles
**Status**: ✅ Active - parallel pipeline

---

### Utility Jobs

#### 17. ProcessCollectedNewsJob
**File**: `app/Jobs/News/ProcessCollectedNewsJob.php`
**Purpose**: Processes collected news (legacy/utility)
**Status**: ✅ Active

---

## Commands

### 1. news:run-daily
**File**: `app/Console/Commands/` (command class not found, likely in NewsWorkflowService or direct dispatch)
**Purpose**: Runs daily workflow for all regions
**Schedule**: Daily at 6:00 AM UTC (`routes/console.php`)
**Status**: ✅ Active - scheduled

---

### 2. news:discover-businesses
**File**: `app/Console/Commands/` (command class not found)
**Purpose**: Discovers businesses for all regions
**Schedule**: Monthly on 1st at 3:00 AM UTC (commented out in `routes/console.php`)
**Status**: ⚠️ Scheduled but commented out

---

### 3. GenerateWeeklyNewsletters
**File**: `app/Console/Commands/GenerateWeeklyNewsletters.php`
**Purpose**: Generates weekly newsletter emails
**Command**: `email:generate-newsletters`
**Schedule**: Weekly on Saturday at 10 PM (`routes/console.php`)
**Status**: ✅ Active - scheduled

---

## Controllers

### API Controllers

#### 1. NewsArticleController
**File**: `app/Http/Controllers/Api/V1/NewsArticleController.php`
**Purpose**: API endpoints for news articles
**Routes**: `routes/api/v1/news-articles.php`
- `GET /api/v1/news-articles`: List articles
- `GET /api/v1/news-articles/{id}`: Show article
- `POST /api/v1/news-articles`: Create article
- `PUT /api/v1/news-articles/{id}`: Update article
- `PATCH /api/v1/news-articles/{id}/approve`: Approve article
- `PATCH /api/v1/news-articles/{id}/reject`: Reject article

**Status**: ✅ Active - API endpoints

---

### Day News Controllers

#### 2. PostController
**File**: `app/Http/Controllers/DayNews/PostController.php`
**Purpose**: Manages Day News posts (published articles)
**Routes**: `routes/day-news.php`
- CRUD operations for posts
- Payment integration
- Publishing workflow

**Status**: ✅ Active - manages published articles

---

#### 3. PublicPostController
**File**: `app/Http/Controllers/DayNews/PublicPostController.php`
**Purpose**: Public-facing post display
**Routes**: `routes/day-news.php`
- `GET /posts/{slug}`: Display public post

**Status**: ✅ Active - public post display

---

## Configuration

### 1. news-workflow.php
**File**: `config/news-workflow.php`
**Purpose**: Main configuration file for news workflow
**Sections**:
- `business_discovery`: Business discovery settings (categories, radius)
- `fetch_frequencies`: Category fetch frequencies
- `category_news_terms`: Search terms for categories
- `news_collection`: News collection settings
- `shortlisting`: Phase 3 settings
- `fact_checking`: Phase 4 settings
- `final_selection`: Phase 5 settings
- `article_generation`: Phase 6 settings
- `publishing`: Phase 7 settings
- `event_extraction`: Event extraction settings
- `ai_models`: AI model configuration per phase
- `apis`: API keys (SERP API, ScrapingBee)
- `google_places`: Google Places API configuration
- `unsplash`: Unsplash API configuration
- `error_handling`: Retry settings
- `prompts`: AI prompts for each phase
- `location_verification`: Location verification settings

**Status**: ✅ Active - comprehensive configuration

---

### 2. services.php
**File**: `config/services.php`
**Purpose**: Third-party service credentials
**Relevant Sections**:
- `google.maps_api_key`: Google Maps/Places API key

**Status**: ✅ Active - service credentials

---

## Routes

### Console Routes
**File**: `routes/console.php`
**Scheduled Commands**:
- `news:run-daily` - Daily at 6:00 AM UTC
- `news:discover-businesses` - Monthly on 1st at 3:00 AM UTC (commented out)

---

### API Routes
**File**: `routes/api/v1/news-articles.php`
**Endpoints**: See NewsArticleController above

---

### Web Routes
**File**: `routes/day-news.php`
**Day News Routes**: Post management, public display, comments, etc.

---

## Workflow Phases

### Phase 1: Business Discovery
**Service**: BusinessDiscoveryService
**Job**: ProcessRegionBusinessDiscoveryJob → ProcessSingleCategoryBusinessDiscoveryJob
**Schedule**: Monthly (commented out)
**Process**:
1. Get categories from config
2. For each category, call GooglePlacesService.discoverBusinessesForCategory()
3. Parse business data
4. Fetch and store photos
5. Upsert businesses to database
6. Link businesses to regions

**Output**: Business records in database

---

### Phase 2: News Collection
**Service**: NewsCollectionService
**Job**: ProcessPhase2NewsCollectionJob → ProcessBusinessNewsCollectionJob, ProcessCategoryNewsCollectionJob
**Schedule**: Daily at 6:00 AM UTC
**Process**:
1. Dispatch jobs for business-specific news (parallel)
2. Fetch category news synchronously
3. Store articles with deduplication (content_hash)
4. Mark articles as unprocessed

**Output**: NewsArticle records

---

### Phase 3: Content Shortlisting
**Service**: ContentCurationService
**Job**: ProcessPhase3ShortlistingJob → ProcessSingleArticleScoringJob
**Schedule**: Chained after Phase 2
**Process**:
1. Get unprocessed NewsArticle records
2. Score each article for relevance (AI)
3. Select top N articles (configurable)
4. Create NewsArticleDraft records with status 'shortlisted'

**Output**: NewsArticleDraft records (shortlisted)

---

### Phase 4: Fact-Checking & Outline Generation
**Service**: FactCheckingService
**Job**: ProcessPhase4FactCheckingJob → ProcessSingleDraftFactCheckingJob
**Schedule**: Chained after Phase 3
**Process**:
1. Get shortlisted drafts
2. Generate article outline (AI)
3. Extract factual claims from outline (AI)
4. Verify each claim (ScrapingBee + AI)
5. Store fact-check results
6. Update draft status to 'outline_generated'

**Output**: NewsArticleDraft with outline, NewsFactCheck records

---

### Phase 5: Final Selection
**Service**: ContentCurationService
**Job**: ProcessPhase5FinalSelectionJob → ProcessSingleDraftEvaluationJob
**Schedule**: Chained after Phase 4
**Process**:
1. Get drafts with outlines
2. Evaluate quality (AI) - checks for placeholders
3. Score drafts
4. Select top N drafts (configurable)
5. Update draft status to 'selected_for_generation'

**Output**: NewsArticleDraft records (selected_for_generation)

---

### Phase 6: Article Generation
**Service**: ArticleGenerationService
**Job**: ProcessPhase6GenerationJob → ProcessSingleArticleGenerationJob
**Schedule**: Chained after Phase 5
**Process**:
1. Get selected drafts
2. Assign writer agent
3. Generate full article content (AI)
4. Generate SEO metadata (AI)
5. Fetch featured image (Unsplash)
6. Update draft status to 'ready_for_publishing'

**Output**: NewsArticleDraft with generated content, SEO metadata, featured image

---

### Phase 7: Publishing
**Service**: PublishingService
**Job**: ProcessPhase7PublishingJob
**Schedule**: Chained after Phase 6
**Process**:
1. Get ready drafts
2. Check if auto-publish threshold met
3. Create DayNewsPost from draft
4. Map topic tags to categories
5. Update draft status to 'published'
6. Link draft to published post

**Output**: DayNewsPost records (published articles)

---

## Parallel Pipeline: Event Extraction

### Event Extraction Pipeline
**Service**: EventExtractionService
**Job**: ProcessEventExtractionJob
**Schedule**: Runs after Phase 2 (parallel to news workflow)
**Process**:
1. Detect events in news articles (AI)
2. Extract event details (AI)
3. Match venues (VenueMatchingService)
4. Match performers (PerformerMatchingService)
5. Validate and publish events (EventPublishingService)

**Output**: Event records

---

## Data Flow Summary

```
Phase 1: Business Discovery
  GooglePlacesService → Business Model

Phase 2: News Collection
  SerpApiService → NewsArticle Model

Phase 3: Shortlisting
  NewsArticle → ContentCurationService → NewsArticleDraft (shortlisted)

Phase 4: Fact-Checking
  NewsArticleDraft → FactCheckingService → NewsArticleDraft (outline_generated) + NewsFactCheck

Phase 5: Final Selection
  NewsArticleDraft → ContentCurationService → NewsArticleDraft (selected_for_generation)

Phase 6: Article Generation
  NewsArticleDraft → ArticleGenerationService → NewsArticleDraft (ready_for_publishing)

Phase 7: Publishing
  NewsArticleDraft → PublishingService → DayNewsPost (published)

Parallel: Event Extraction
  NewsArticle → EventExtractionService → Event
```

---

## Key Dependencies

### External APIs
- **Google Places API**: Business discovery, photos
- **SERP API**: News article fetching
- **ScrapingBee API**: Web scraping for fact-checking
- **Unsplash API**: Featured images
- **OpenRouter (Prism AI)**: All AI operations

### Internal Services
- **AgentAssignmentService**: Writer agent assignment
- **Region Model**: Geographic targeting
- **Business Model**: Business data
- **DayNewsPost Model**: Published articles
- **Event Model**: Extracted events

---

## Status Summary

✅ **Active Components**: All core services, models, jobs, and workflows are active
⚠️ **Placeholder**: ContentShortlistingService (empty, functionality in ContentCurationService)
⚠️ **Commented Out**: Monthly business discovery schedule (but jobs exist)
✅ **Updated**: GooglePlacesService integration complete
✅ **Deprecated**: SerpApiService business discovery methods (still used for news)

---

## Notes for AI Analysis

1. **Workflow is Job-Based**: All phases use Laravel jobs for parallel processing
2. **Hybrid Publishing**: Auto-publish for high-quality articles, manual review for others
3. **Deduplication**: Content hashing prevents duplicate articles
4. **Location Verification**: Enhanced prompts prevent geographic mismatches
5. **Event Extraction**: Parallel pipeline extracts events from news articles
6. **Writer Agents**: Articles are assigned to writer agents for consistency
7. **Photo Management**: Business photos and featured images are stored locally with CDN proxy support

This documentation provides a complete picture of the news workflow system for analysis and comparison against desired outcomes.

