# Automatic News Generation Workflow

## Overview
This document defines the automated news generation workflow for Day News. The system discovers businesses in regions, fetches relevant news, uses AI to generate curated content, and auto-publishes articles.

**Note**: Existing migrations and models for businesses and news articles are already in place. Build upon existing database structure.

---

## Technical Stack
- **SERPAPI** (serpapi.com) - Business discovery and news search
- **ScrapingBee** (scrapingbee.com) - Web scraping for fact-checking
- **Prism PHP** (already installed) - LLM integration for content generation
- **Laravel Queue System** - Job processing
- **Laravel Scheduler** - Automated execution

---

## Implementation Requirements

### 1. Configuration
Create/update configuration files:
- API keys for SERPAPI and ScrapingBee in `.env`
- Prism PHP AI model configuration in `config/` directory
- Business search categories in config
- News generation parameters (articles per region, thresholds, etc.)

### 2. Database Schema
**Rules:**
- Use `text` column type (PostgreSQL - no character limits)
- Merge related migrations into single files where possible
- Reuse existing tables - DO NOT recreate business/news tables
- Add new tables only for:
  - News article drafts tracking
  - AI generation metadata
  - Fact-checking results
  - Publishing status tracking

### 3. Code Organization
**Conventions:**
- Services: `app/Services/News/` subdirectory
- Jobs: `app/Jobs/News/` subdirectory
- Actions: Use `php artisan make:action` for discrete operations
- Follow Laravel action pattern for separation of concerns

---

## Workflow Pipeline

### Phase 1: Business Discovery
**Goal**: Find and store businesses in target regions

**Implementation:**
- **Service**: `App\Services\News\SerpApiService`
- **Job**: `App\Jobs\News\FetchBusinessesJob`
- **Action**: `App\Actions\News\UpsertBusinessAction`
- **Schedule**: Monthly per region (1st of month at 2 AM)

**Process:**
1. Query SERPAPI with region coordinates and configured categories
2. Extract business data (name, location, category, contact info, etc.)
3. Upsert businesses to database (avoid duplicates)
4. Store raw API response metadata for auditing

### Phase 2: News Collection
**Goal**: Gather latest news about businesses and categories

**Implementation:**
- **Service**: `App\Services\News\SerpApiService` (extend for News API)
- **Job**: `App\Jobs\News\FetchNewsArticlesJob`
- **Action**: `App\Actions\News\StoreNewsArticleAction`
- **Schedule**: Daily at 12:00 AM per region

**Process:**
1. Fetch news for each business using SERPAPI News API
2. Track previously fetched articles to avoid duplicates (store article URLs/hashes)
3. **Fallback**: If insufficient business news, fetch category news for region
4. Store raw news data with metadata (source, publish date, URL, content snippet)

### Phase 3: Initial Content Shortlisting
**Goal**: AI-driven shortlist of newsworthy articles

**Implementation:**
- **Service**: `App\Services\News\PrismAiService`
- **Job**: `App\Jobs\News\ShortlistNewsArticlesJob`
- **Action**: `App\Actions\News\CreateDraftArticleAction`
- **Schedule**: Daily after Phase 2 completion (chain job)

**Process:**
1. Load all unprocessed news articles for region
2. Use Prism PHP to analyze articles for:
   - Relevance to local audience
   - Newsworthiness score
   - Topic diversity
3. Select configured number of top articles (e.g., 10 per region)
4. Create draft records with "shortlisted" status

### Phase 4: Outline Generation & Fact-Checking
**Goal**: Generate article outlines with verified facts

**Implementation:**
- **Service**: `App\Services\News\PrismAiService`, `App\Services\News\ScrapingBeeService`
- **Job**: `App\Jobs\News\GenerateArticleOutlinesJob`
- **Action**: `App\Actions\News\FactCheckContentAction`, `App\Actions\News\UpdateDraftOutlineAction`
- **Schedule**: Daily after Phase 3 completion (chain job)

**Process:**
1. For each shortlisted draft:
   - Use LLM to generate structured article outline
   - Extract key claims that need fact-checking
2. Use ScrapingBee to verify facts against multiple sources
3. Update draft with:
   - Generated outline
   - Fact-check results and source citations
   - Flag unverified claims for review
4. Mark draft as "outline_generated"

### Phase 5: Final Article Selection
**Goal**: AI curates best articles for publication

**Implementation:**
- **Service**: `App\Services\News\PrismAiService`
- **Job**: `App\Jobs\News\SelectFinalArticlesJob`
- **Action**: `App\Actions\News\MarkArticleForPublishingAction`
- **Schedule**: Daily after Phase 4 completion (chain job)

**Process:**
1. Review all "outline_generated" drafts for region
2. Use LLM to evaluate:
   - Fact-check confidence scores
   - Content quality and completeness
   - Regional news balance (avoid duplicate topics)
3. Select final articles for publication (configured threshold)
4. Mark selected drafts as "ready_for_generation"

### Phase 6: Final Article Generation
**Goal**: Generate publication-ready articles

**Implementation:**
- **Service**: `App\Services\News\PrismAiService`
- **Job**: `App\Jobs\News\GenerateFinalArticleJob`
- **Action**: `App\Actions\News\GenerateArticleContentAction`
- **Schedule**: Daily after Phase 5 completion (chain job)

**Process:**
1. For each "ready_for_generation" draft:
   - Use LLM to write complete article from outline
   - Include fact-checked citations
   - Generate SEO metadata (title, description, keywords)
   - Create featured image prompt or select from sources
2. Store final content in publishable format
3. Mark draft as "ready_for_publishing"

### Phase 7: Auto-Publishing
**Goal**: Publish articles to Day News platform

**Implementation:**
- **Service**: `App\Services\News\PublishingService`
- **Job**: `App\Jobs\News\PublishArticleJob`
- **Action**: `App\Actions\News\PublishArticleAction`
- **Schedule**: Daily after Phase 6 completion (chain job)

**Process:**
1. For each "ready_for_publishing" draft:
   - Create/update Day News post record
   - Associate with region and categories
   - Set publication status and timestamp
   - Generate social media preview cards
2. Mark as "published"
3. Log publication event for analytics

---

## Automatic Workflow Triggering

### Phase 2 (News Collection) - Job-Based Architecture
The news collection phase dispatches multiple parallel jobs (one per business) to improve performance. The system automatically tracks job completion and triggers subsequent phases when all jobs finish.

**How it Works:**
1. `NewsCollectionService->dispatchBusinessNewsJobs()` initializes a cache counter with the number of businesses:
   - Cache key: `news_collection_jobs:{region_id}`
   - Initial value: Number of businesses
   - TTL: 24 hours

2. Each `ProcessBusinessNewsCollectionJob` decrements the counter when it completes (success or failure)

3. The last job to finish (counter hits 0) automatically triggers `php artisan news:process-collected --region={id}`

4. This command runs Phases 3-7 sequentially for that region

**Benefits:**
- No manual intervention needed between phases
- Handles job failures gracefully (workflow still triggers)
- Scales to any number of businesses per region
- Atomic counter prevents race conditions

**Commands:**
```bash
# Manually trigger Phases 3-7 (if needed)
php artisan news:process-collected --region=1

# Or for all active regions
php artisan news:process-collected
```

### Cache-Based Job Tracking
```php
// Initialized when jobs are dispatched
Cache::put("news_collection_jobs:{$regionId}", $businessCount, now()->addHours(24));

// Atomically decremented by each job
$pendingJobs = Cache::decrement("news_collection_jobs:{$regionId}");

// Last job triggers workflow
if ($pendingJobs <= 0) {
    Artisan::call('news:process-collected', ['--region' => $regionId]);
}
```

---

## Error Handling & Monitoring
- Log all API failures and retry with exponential backoff
- Alert on fact-check failures (low confidence scores)
- Track job completion times and queue health
- Implement manual review flag for edge cases
- Store error details with draft records for debugging

---

## Testing Requirements
- Unit tests for each Action class
- Feature tests for complete workflow per phase
- Mock external API responses (SERPAPI, ScrapingBee)
- Test job chaining and failure scenarios
- Test AI response parsing and error handling

---

## Commands to Generate Structure

```bash
# Services
php artisan make:class Services/News/SerpApiService
php artisan make:class Services/News/ScrapingBeeService
php artisan make:class Services/News/PrismAiService
php artisan make:class Services/News/PublishingService

# Jobs (with ShouldQueue)
php artisan make:job Jobs/News/FetchBusinessesJob
php artisan make:job Jobs/News/FetchNewsArticlesJob
php artisan make:job Jobs/News/ShortlistNewsArticlesJob
php artisan make:job Jobs/News/GenerateArticleOutlinesJob
php artisan make:job Jobs/News/SelectFinalArticlesJob
php artisan make:job Jobs/News/GenerateFinalArticleJob
php artisan make:job Jobs/News/PublishArticleJob

# Actions
php artisan make:action Actions/News/UpsertBusinessAction
php artisan make:action Actions/News/StoreNewsArticleAction
php artisan make:action Actions/News/CreateDraftArticleAction
php artisan make:action Actions/News/FactCheckContentAction
php artisan make:action Actions/News/UpdateDraftOutlineAction
php artisan make:action Actions/News/MarkArticleForPublishingAction
php artisan make:action Actions/News/GenerateArticleContentAction
php artisan make:action Actions/News/PublishArticleAction
```

---

## Next Steps for Implementation
1. Review existing business and news models/migrations
2. Design draft article tracking schema
3. Set up API credentials in `.env`
4. Configure Prism PHP with desired AI model
5. Implement Phase 1 (Business Discovery) first
6. Test each phase independently before chaining
7. Set up Laravel Scheduler for production cron
