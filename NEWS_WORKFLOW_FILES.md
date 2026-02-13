# News Workflow Files Reference

This document identifies all files involved in finding news sources, reading news sources, creating articles, and follow-ups.

## Table of Contents
1. [News Source Discovery](#news-source-discovery)
2. [News Source Reading/Collection](#news-source-readingcollection)
3. [Article Creation](#article-creation)
4. [Follow-ups & Story Threads](#follow-ups--story-threads)
5. [Workflow Orchestration](#workflow-orchestration)
6. [Supporting Services](#supporting-services)
7. [Models](#models)
8. [Jobs](#jobs)
9. [Commands](#commands)

---

## News Source Discovery

### Business Discovery
**Purpose**: Find businesses that could be news sources (organizations, government, schools, etc.)

- **`app/Services/News/BusinessDiscoveryService.php`**
  - Discovers businesses from Google Places
  - Auto-creates NewsSource records from businesses with news potential
  - Creates collection methods (web scraping) for discovered sources

- **`app/Services/News/GooglePlacesService.php`**
  - Integrates with Google Places API
  - Discovers businesses by category and location
  - Fetches business details, photos, and metadata

### Civic Source Discovery
**Purpose**: Discover government and civic sources (Legistar, CivicPlus, Nixle, etc.)

- **`app/Services/Civic/CivicSourceCollectionService.php`**
  - Main service for discovering civic sources
  - `discoverSourcesForRegion()` - Discovers Legistar, CivicPlus, Nixle sources
  - Creates civic sources and collection methods

- **`app/Services/Civic/LegistarService.php`**
  - Discovers Legistar clients (city council meeting systems)
  - `discoverClient()` - Finds Legistar instance for a city

- **`app/Services/Civic/CivicPlusService.php`**
  - Detects CivicPlus municipal websites
  - `detectCivicPlus()` - Checks if URL is a CivicPlus site

- **`app/Services/Civic/NixleService.php`**
  - Creates Nixle sources for ZIP codes
  - Handles emergency alerts and public safety notifications

- **`app/Services/Civic/GranicusMediaService.php`**
  - Handles Granicus media platform sources
  - Processes government media content

- **`app/Services/Civic/PerplexityDiscoveryService.php`**
  - Uses Perplexity AI to discover news sources
  - AI-powered source discovery

### Discovery Commands
- **`app/Console/Commands/DiscoverCivicSourcesCommand.php`**
  - CLI command to discover civic sources for regions

- **`app/Console/Commands/NewsWorkflow/RunBusinessDiscovery.php`**
  - Runs business discovery workflow

---

## News Source Reading/Collection

### RSS Collection
**Purpose**: Read RSS feeds from news sources

- **`app/Services/Newsroom/RssCollectionService.php`**
  - Collects content from RSS feeds
  - Parses feed items using SimplePie
  - Creates RawContent records
  - Handles deduplication via content hash

### Web Scraping
**Purpose**: Scrape websites for news content

- **`app/Services/Newsroom/WebScrapingService.php`**
  - Main web scraping service
  - `scrape()` - Entry point for scraping
  - `scrapeWithPlaywright()` - JavaScript-enabled scraping
  - `scrapeSimple()` - Simple HTTP scraping
  - Creates RawContent records from scraped content

- **`app/Services/News/ScrapingBeeService.php`**
  - Uses ScrapingBee API for web scraping
  - Handles JavaScript rendering
  - Fact-checking web searches

### News Collection Services
**Purpose**: Collect news from various APIs and sources

- **`app/Services/News/NewsCollectionService.php`**
  - Main news collection orchestrator
  - `collectForRegion()` - Collects news for a region
  - Coordinates business news and category news collection

- **`app/Services/News/LegacyNewsCollectionService.php`**
  - Legacy implementation (may be deprecated)

- **`app/Services/News/SerpApiService.php`**
  - Integrates with SerpAPI for news search
  - Fetches news articles from search results
  - Used for business-specific and category news

### Civic Content Collection
**Purpose**: Collect content from civic sources

- **`app/Services/Civic/CivicSourceCollectionService.php`**
  - `collectFromSource()` - Collects content from a civic source
  - `createNewsArticleFromCivicContent()` - Converts civic content to NewsArticle
  - Processes Legistar meetings, CivicPlus content, Nixle alerts

- **`app/Services/Civic/LegistarService.php`**
  - `fetchMeetings()` - Fetches city council meetings
  - `fetchAgendaItems()` - Gets meeting agenda details

- **`app/Services/Civic/CivicPlusService.php`**
  - `fetchContent()` - Collects content from CivicPlus sites

- **`app/Services/Civic/NixleService.php`**
  - `fetchAlerts()` - Collects emergency alerts

### Collection Commands
- **`app/Console/Commands/Newsroom/NewsroomCollectCommand.php`**
  - CLI command to collect news from sources

- **`app/Console/Commands/NewsWorkflow/ProcessCollectedNewsCommand.php`**
  - Processes collected news content

---

## Article Creation

### Content Classification & Scoring
**Purpose**: Analyze and score collected content

- **`app/Services/Newsroom/ContentClassificationService.php`**
  - Classifies content by topic, category, relevance
  - Determines content tier (brief, standard, full)

- **`app/Services/News/ContentCurationService.php`**
  - `shortlistArticles()` - AI-driven shortlisting
  - `finalSelection()` - Final article selection
  - Scores articles for newsworthiness

- **`app/Services/News/ContentShortlistingService.php`**
  - Alternative shortlisting implementation

### Fact Checking
**Purpose**: Verify facts and generate article outlines

- **`app/Services/News/FactCheckingService.php`**
  - `processForRegion()` - Processes drafts for fact-checking
  - `generateOutline()` - Generates article outline using AI
  - `extractFactualClaims()` - Extracts claims from outline
  - `verifyClaim()` - Verifies individual claims using web search
  - Creates NewsFactCheck records

### Article Generation
**Purpose**: Generate full article content from drafts

- **`app/Services/News/ArticleGenerationService.php`**
  - `generateArticles()` - Generates articles for a region
  - `generateFinalArticle()` - Uses Prism AI to generate article
  - `generateArticleFromRawContent()` - Generates from RawContent
  - Creates DayNewsPost records
  - Generates SEO metadata
  - Fetches featured images

- **`app/Services/News/PrismAiService.php`**
  - AI service wrapper for article generation
  - `generateFinalArticle()` - Main article generation method
  - `generateJson()` - JSON-structured AI responses
  - Uses OpenRouter API

### Publishing
**Purpose**: Publish generated articles

- **`app/Services/News/PublishingService.php`**
  - `publishArticles()` - Publishes ready articles
  - `publishDraft()` - Publishes a single draft
  - Creates DayNewsPost from NewsArticleDraft
  - Handles auto-publish logic

- **`app/Services/News/EventPublishingService.php`**
  - Publishes events extracted from articles
  - Matches venues and performers

### Image & Media Services
- **`app/Services/News/UnsplashService.php`**
  - Fetches images from Unsplash
  - `fetchImage()` - Gets featured images for articles

- **`app/Services/News/ImageStorageService.php`**
  - Handles image storage and processing

---

## Follow-ups & Story Threads

### Story Analysis
**Purpose**: Analyze articles to identify ongoing stories

- **`app/Services/Story/StoryAnalysisService.php`**
  - `analyzeArticle()` - Analyzes if article is part of ongoing story
  - `analyzeThreadForFollowUp()` - Determines if thread needs follow-up
  - `findMatchingThread()` - Finds existing thread for article
  - `createThreadFromArticle()` - Creates new story thread
  - `generateFollowUpSuggestions()` - Suggests follow-up angles
  - Uses AI to identify story patterns

### Story Follow-up
**Purpose**: Manage follow-up articles and story threads

- **`app/Services/Story/StoryFollowUpService.php`**
  - `processNewArticle()` - Processes new article for thread matching
  - `processHighEngagementArticles()` - Creates threads from high-engagement articles
  - `updateThreadStatuses()` - Updates thread status based on activity
  - `generateFollowUpArticles()` - Generates follow-up article suggestions
  - Manages StoryThread lifecycle

### Engagement Scoring
**Purpose**: Score articles for engagement potential

- **`app/Services/Story/EngagementScoringService.php`**
  - Scores articles for engagement
  - `getHighEngagementUnthreaded()` - Gets high-engagement articles without threads

### Story Commands
- **`app/Console/Commands/ManageStoryThreads.php`**
  - CLI command to manage story threads

---

## Workflow Orchestration

### Main Workflow Service
- **`app/Services/News/NewsWorkflowService.php`**
  - Main orchestrator for entire news workflow
  - `runCompleteWorkflow()` - Runs all 7 phases
  - `runDailyWorkflow()` - Runs daily phases (skips business discovery)
  - `runBusinessDiscovery()` - Runs only business discovery
  - Coordinates all workflow phases:
    1. Business Discovery
    2. News Collection
    3. Content Shortlisting
    4. Fact-Checking
    5. Final Selection
    6. Article Generation
    7. Publishing

### Workflow Settings
- **`app/Services/News/WorkflowSettingsService.php`**
  - Manages workflow configuration
  - Gets workflow settings per region
  - Configures AI models, thresholds, etc.

### Traffic Control
- **`app/Services/News/TrafficControlService.php`**
  - Controls workflow execution rate
  - Prevents API rate limiting
  - Manages concurrent processing

### Fetch Frequency
- **`app/Services/News/FetchFrequencyService.php`**
  - Manages how often sources are fetched
  - Configures poll intervals

---

## Supporting Services

### Business Matching
- **`app/Services/Newsroom/BusinessMatchingService.php`**
  - Matches news content to businesses
  - Links articles to business records

### Venue & Performer Matching
- **`app/Services/News/VenueMatchingService.php`**
  - Matches event venues to business records

- **`app/Services/News/PerformerMatchingService.php`**
  - Matches performers/artists to records

### Event Extraction
- **`app/Services/News/EventExtractionService.php`**
  - Extracts events from news articles
  - `extractEventsFromArticle()` - Uses AI to find events
  - Creates event records

---

## Models

### Core Models
- **`app/Models/NewsSource.php`**
  - Represents a news source (RSS, website, civic source, etc.)
  - Has many CollectionMethods

- **`app/Models/CollectionMethod.php`**
  - Represents how content is collected from a source
  - Types: RSS, scrape, API, etc.
  - Stores endpoint URLs, selectors, config

- **`app/Models/RawContent.php`**
  - Raw content collected from sources
  - Before processing/classification
  - Has content_hash for deduplication

- **`app/Models/NewsArticle.php`**
  - Processed news article (from collection phase)
  - Before article generation
  - Has region_id, source info, content_snippet

- **`app/Models/NewsArticleDraft.php`**
  - Draft article in workflow
  - Statuses: shortlisted, outline_generated, selected_for_generation, ready_for_publishing, published
  - Contains outline, fact-check results

- **`app/Models/NewsFactCheck.php`**
  - Fact-check results for claims
  - Links to NewsArticleDraft
  - Stores claim, verification status, sources

- **`app/Models/DayNewsPost.php`**
  - Final published article
  - WordPress-style post model
  - Has content, SEO metadata, featured image

### Story Models
- **`app/Models/StoryThread.php`**
  - Represents an ongoing news story
  - Has many articles
  - Tracks key people, organizations, locations, dates
  - Has predicted story beats

- **`app/Models/StoryFollowUpTrigger.php`**
  - Triggers for follow-up articles
  - Conditions for when to create follow-ups

### Civic Models
- **`app/Models/CivicSource.php`**
  - Civic/government source (Legistar, CivicPlus, etc.)
  - Has platform type

- **`app/Models/CivicContentItem.php`**
  - Content item from civic source
  - Meetings, alerts, announcements, etc.

---

## Jobs

### Discovery Jobs
- **`app/Jobs/News/ProcessBusinessDiscoveryDispatcherJob.php`**
  - Dispatches business discovery for regions

- **`app/Jobs/News/ProcessRegionBusinessDiscoveryJob.php`**
  - Processes business discovery for a region

- **`app/Jobs/News/ProcessSingleCategoryBusinessDiscoveryJob.php`**
  - Discovers businesses for a category

### Collection Jobs
- **`app/Jobs/News/ProcessPhase2NewsCollectionJob.php`**
  - Phase 2: News collection dispatcher

- **`app/Jobs/News/ProcessBusinessNewsCollectionJob.php`**
  - Collects news for businesses

- **`app/Jobs/News/ProcessCategoryNewsCollectionJob.php`**
  - Collects category news

- **`app/Jobs/News/ProcessSingleCategoryNewsCollectionJob.php`**
  - Collects news for a single category

- **`app/Jobs/News/ProcessCollectedNewsJob.php`**
  - Processes collected news

- **`app/Jobs/News/ProcessCivicSourcesJob.php`**
  - Processes civic sources

- **`app/Jobs/News/ProcessSingleCivicSourceJob.php`**
  - Processes a single civic source

### Processing Jobs
- **`app/Jobs/News/ProcessPhase3ShortlistingJob.php`**
  - Phase 3: Content shortlisting

- **`app/Jobs/News/ProcessSingleArticleScoringJob.php`**
  - Scores a single article for shortlisting

- **`app/Jobs/News/ProcessPhase4FactCheckingJob.php`**
  - Phase 4: Fact-checking

- **`app/Jobs/News/ProcessSingleDraftFactCheckingJob.php`**
  - Fact-checks a single draft

- **`app/Jobs/News/ProcessPhase5FinalSelectionJob.php`**
  - Phase 5: Final selection

- **`app/Jobs/News/ProcessSingleDraftEvaluationJob.php`**
  - Evaluates a single draft

- **`app/Jobs/News/ProcessPhase6GenerationJob.php`**
  - Phase 6: Article generation

- **`app/Jobs/News/ProcessSingleArticleGenerationJob.php`**
  - Generates a single article

- **`app/Jobs/News/ProcessPhase7PublishingJob.php`**
  - Phase 7: Publishing

### Workflow Jobs
- **`app/Jobs/News/ProcessRegionDailyWorkflowJob.php`**
  - Runs daily workflow for a region

### Event Jobs
- **`app/Jobs/News/ProcessEventExtractionJob.php`**
  - Extracts events from articles

### Legacy Jobs
- **`app/Jobs/News/ProcessPhase3SelectionJob.php`**
  - Legacy selection job

- **`app/Jobs/News/ProcessPhase5SelectionJob.php`**
  - Legacy selection job

---

## Commands

### Workflow Commands
- **`app/Console/Commands/NewsWorkflow/RunDailyWorkflow.php`**
  - Runs daily workflow for all regions

- **`app/Console/Commands/NewsWorkflow/RunBusinessDiscovery.php`**
  - Runs business discovery

- **`app/Console/Commands/NewsWorkflow/ProcessCollectedNewsCommand.php`**
  - Processes collected news

- **`app/Console/Commands/NewsWorkflow/ShowWorkflowStats.php`**
  - Shows workflow statistics

### Newsroom Commands
- **`app/Console/Commands/Newsroom/NewsroomCollectCommand.php`**
  - Collects news from sources

- **`app/Console/Commands/Newsroom/NewsroomProcessCommand.php`**
  - Processes collected content

- **`app/Console/Commands/Newsroom/NewsroomClassifyCommand.php`**
  - Classifies content

- **`app/Console/Commands/Newsroom/NewsroomRunCommand.php`**
  - Runs full newsroom workflow

- **`app/Console/Commands/Newsroom/NewsroomStatsCommand.php`**
  - Shows newsroom statistics

### Civic Commands
- **`app/Console/Commands/DiscoverCivicSourcesCommand.php`**
  - Discovers civic sources

- **`app/Console/Commands/ManageCivicSources.php`**
  - Manages civic sources

### Story Commands
- **`app/Console/Commands/ManageStoryThreads.php`**
  - Manages story threads

### Event Commands
- **`app/Console/Commands/RunEventExtractionCommand.php`**
  - Runs event extraction

### Utility Commands
- **`app/Console/Commands/SyncFetchFrequenciesCommand.php`**
  - Syncs fetch frequencies

- **`app/Console/Commands/NewsWorkflow/TestOpenRouterCommand.php`**
  - Tests OpenRouter API

---

## Configuration Files

- **`config/news-workflow.php`**
  - Workflow configuration
  - AI model settings
  - Phase thresholds
  - Region-specific settings

- **`config/civic-sources.php`**
  - Civic source configuration
  - Platform settings

---

## Workflow Phases Summary

1. **Business Discovery** (Monthly)
   - Finds businesses → Creates NewsSource records

2. **News Collection** (Daily)
   - Collects from RSS, web scraping, APIs → Creates NewsArticle records

3. **Content Shortlisting** (Daily)
   - Scores articles → Creates NewsArticleDraft (shortlisted)

4. **Fact-Checking** (Daily)
   - Generates outlines → Verifies facts → Updates NewsArticleDraft (outline_generated)

5. **Final Selection** (Daily)
   - Evaluates drafts → Selects top articles → Updates NewsArticleDraft (selected_for_generation)

6. **Article Generation** (Daily)
   - Generates full articles → Updates NewsArticleDraft (ready_for_publishing)

7. **Publishing** (Daily)
   - Publishes articles → Creates DayNewsPost records

---

## Parallel Workflows

### Story Threads
- Analyzes articles for ongoing stories
- Creates StoryThread records
- Generates follow-up suggestions
- Links related articles

### Event Extraction
- Extracts events from articles
- Matches venues and performers
- Creates event records

---

## Key Entry Points

1. **Daily Workflow**: `app/Console/Commands/NewsWorkflow/RunDailyWorkflow.php`
2. **Business Discovery**: `app/Console/Commands/NewsWorkflow/RunBusinessDiscovery.php`
3. **News Collection**: `app/Console/Commands/Newsroom/NewsroomCollectCommand.php`
4. **Story Management**: `app/Console/Commands/ManageStoryThreads.php`
5. **Civic Discovery**: `app/Console/Commands/DiscoverCivicSourcesCommand.php`
