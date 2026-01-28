# Story Thread & Follow-Up System

An AI-powered system for tracking ongoing news stories and automatically identifying when follow-up articles are needed.

## The Problem This Solves

News stories don't end with a single article. Consider these examples:

**Missing Person Case:**
1. "Lifeguard Missing After Rescue" → Day 1
2. "Coast Guard Continues Search for Missing Lifeguard" → Day 2
3. "Search Area Expands as Family Appeals for Help" → Day 3
4. "Coast Guard Suspends Search After 4 Days" → Day 5
5. "Community Organizes Private Search Effort" → Day 7

**Criminal Case:**
1. "Driver Kills Woman in Head-On Collision" → Initial
2. "Police Investigating, Suspect Released" → Day 2
3. "Charges Filed Against Driver" → Week 2
4. "Driver Arraigned, Trial Date Set" → Month 1
5. "Trial Begins in Fatal Collision Case" → Month 3
6. "Driver Found Guilty of Vehicular Manslaughter" → Month 4
7. "Sentencing Hearing Scheduled" → Month 5

Without a system, editors must manually remember all ongoing stories and check for updates. Stories slip through the cracks, and readers are left without closure.

## How It Works

### 1. Story Thread Detection

When a high-engagement article is published, AI analyzes it to determine:
- Is this an ongoing story or a one-time event?
- Is the story resolved or unresolved?
- What are the key entities (people, organizations, dates)?
- What might happen next?

```php
$analysis = $analysisService->analyzeArticle($article);

// Returns:
[
  'is_ongoing_story' => true,
  'is_resolved' => false,
  'key_people' => [
    ['name' => 'John Smith', 'role' => 'suspect'],
    ['name' => 'Jane Doe', 'role' => 'victim'],
  ],
  'key_dates' => [
    ['date' => '2025-03-15', 'event' => 'Court hearing'],
  ],
  'predicted_beats' => [
    ['title' => 'Charges filed', 'likelihood' => 80],
    ['title' => 'Arraignment', 'likelihood' => 75],
    ['title' => 'Trial begins', 'likelihood' => 60],
  ],
  'unresolved_questions' => [
    'Will charges be filed?',
    'What was the cause of the crash?',
  ],
]
```

### 2. Thread Creation

Articles are grouped into "story threads" - collections of related articles that tell the complete story.

```php
// Create thread from article
$thread = $analysisService->createThreadFromArticle($article);

// Or add to existing thread
$existingThread = $analysisService->findMatchingThread($article, $region);
if ($existingThread) {
    $existingThread->addArticle($article, 'development');
}
```

### 3. Follow-Up Triggers

The system creates triggers that automatically check for follow-up conditions:

| Trigger Type | Condition | Example |
|--------------|-----------|---------|
| `time_based` | No update in X days | Check if any news after 3 days |
| `engagement_threshold` | High reader interest | >1000 views or >50 comments |
| `date_event` | Scheduled event approaching | Court date in 2 days |
| `resolution_check` | Watch for resolution keywords | "found", "arrested", "verdict" |
| `scheduled_search` | Periodic news search | Weekly search for key names |

### 4. Engagement Scoring

Not every story deserves follow-up. The system calculates engagement scores based on:

- **Views**: Normalized against category average
- **Comments**: Strong signal of reader investment (35% weight)
- **Shares**: Social amplification (25% weight)
- **Time on page**: Reading depth (10% weight)
- **Momentum**: Is engagement increasing or decreasing?

```php
$score = $engagementService->calculateArticleScore($article);

// 80+ = High engagement, definitely follow up
// 60-80 = Good engagement, consider follow up
// <60 = Normal engagement, follow up only if breaking
```

### 5. Follow-Up Queue

The system generates a prioritized queue for editors:

```
┌────────────────────────────────────────────────────────────────────┐
│ Follow-Up Queue                                                    │
├────────────────────────────────────────────────────────────────────┤
│ 1. [Priority: 95] Missing Lifeguard Search                         │
│    Last update: 2 days ago | Engagement: 87 | Comments: 156        │
│    Suggested: "Coast Guard Expected to Announce Search Status"     │
│    Angle: Contact Coast Guard PR for statement on search status    │
│                                                                    │
│ 2. [Priority: 82] DUI Fatality - Smith Case                        │
│    Last update: 5 days ago | Engagement: 74 | Comments: 89         │
│    Suggested: "Charges Expected in Fatal DUI Crash"                │
│    Angle: Check court records for charging decision                │
│                                                                    │
│ 3. [Priority: 71] Downtown Development Proposal                    │
│    Last update: 7 days ago | Engagement: 65 | Comments: 45         │
│    Suggested: "City Council to Vote on Downtown Project"           │
│    Angle: Council meeting on Tuesday, preview the vote             │
└────────────────────────────────────────────────────────────────────┘
```

## Database Schema

### Core Tables

```sql
story_threads
├── id (uuid)
├── region_id
├── title, slug, summary
├── category, subcategory, tags
├── priority (critical|high|medium|low)
├── status (developing|monitoring|resolved|dormant|archived)
├── is_resolved, resolution_type, resolution_summary
├── key_people, key_organizations, key_locations, key_dates (JSON)
├── predicted_beats, monitoring_keywords (JSON)
├── total_articles, total_views, total_comments, total_shares
├── avg_engagement_score
├── first_article_at, last_article_at, next_check_at
└── timestamps

story_thread_articles
├── story_thread_id
├── news_article_id
├── sequence_number
├── narrative_role (origin|development|update|resolution)
├── contribution_summary
└── engagement metrics at time of linking

story_follow_up_triggers
├── story_thread_id
├── trigger_type
├── conditions (JSON)
├── status (pending|triggered|completed|expired)
├── check_at, expires_at
├── trigger_reason, trigger_data
└── resulting_article_id

story_beats
├── story_thread_id
├── title, description
├── status (predicted|expected|occurred|skipped)
├── predicted_date, expected_date, occurred_at
├── likelihood
└── news_article_id (when occurred)
```

## CLI Commands

```bash
# List story threads for a region
php artisan story:threads list --region="Tampa"

# List only developing threads
php artisan story:threads list --region="Tampa" --status=developing

# Show thread details
php artisan story:threads show --thread=<uuid>

# Analyze an article for follow-up potential
php artisan story:threads analyze --article=<uuid>

# Create thread from article
php artisan story:threads create --article=<uuid>

# View pending triggers
php artisan story:threads triggers --region="Tampa"
php artisan story:threads triggers --thread=<uuid>

# Generate follow-up queue
php artisan story:threads queue --region="Tampa"

# Process triggers and find follow-ups
php artisan story:threads process --region="Tampa" --sync

# View statistics
php artisan story:threads stats --region="Tampa"
```

## Configuration

```php
// config/story-threads.php

return [
    // Engagement thresholds
    'engagement' => [
        'high_threshold' => 75,          // Score to consider "high engagement"
        'auto_thread_threshold' => 80,    // Auto-create thread above this
    ],

    // Follow-up timing
    'follow_up' => [
        'default_check_days' => 3,        // Default days between checks
        'max_checks' => 10,               // Max times to check before giving up
        'stale_days' => 7,                // Days without update = stale
        'dormant_days' => 14,             // Days to mark as dormant
    ],

    // Priority categories
    'priority_categories' => [
        'critical' => ['missing_person', 'active_emergency'],
        'high' => ['crime', 'legal', 'public_safety'],
        'medium' => ['politics', 'government', 'business'],
        'low' => ['community', 'entertainment'],
    ],

    // AI analysis
    'ai' => [
        'model' => 'claude-sonnet-4-20250514',
        'max_tokens' => 2000,
    ],
];
```

## Integration with News Workflow

Add to your Kernel.php:

```php
// Run follow-up processing every 6 hours
$schedule->command('story:threads process --region=Tampa')
    ->everyFourHours()
    ->withoutOverlapping();

// Or use the job directly
$schedule->job(new ProcessStoryFollowUpsJob($region))
    ->everyFourHours();
```

## API Endpoints (for React Native app)

```php
// routes/api.php

Route::prefix('story-threads')->group(function () {
    // List threads for region
    Route::get('/', [StoryThreadController::class, 'index']);
    
    // Get thread with articles
    Route::get('/{thread}', [StoryThreadController::class, 'show']);
    
    // Get follow-up queue
    Route::get('/queue', [StoryThreadController::class, 'queue']);
    
    // Mark thread as resolved
    Route::post('/{thread}/resolve', [StoryThreadController::class, 'resolve']);
});
```

## Example: Complete Flow

```php
// 1. New article comes in with high engagement
$article = NewsArticle::find($articleId);

// 2. Check engagement score
$score = $engagementService->calculateArticleScore($article);

if ($score >= 75) {
    // 3. Analyze for thread potential
    $analysis = $analysisService->analyzeArticle($article);
    
    if ($analysis['is_ongoing_story'] && !$analysis['is_resolved']) {
        // 4. Check for existing thread
        $thread = $analysisService->findMatchingThread($article, $region);
        
        if ($thread) {
            // 5a. Add to existing thread
            $thread->addArticle($article, 'development');
        } else {
            // 5b. Create new thread
            $thread = $analysisService->createThreadFromArticle($article);
        }
        
        // 6. Triggers are auto-created based on analysis
        // - Time-based: check in 3 days
        // - Date events: court hearing reminders
        // - Resolution: watch for keywords
    }
}

// 7. Periodic processing (every 6 hours)
$followUpService->processTriggers($region);

// 8. Generate queue for editors
$queue = $followUpService->generateFollowUpQueue($region);
```

## Files in This Package

```
app/
├── Console/Commands/
│   └── ManageStoryThreads.php          # CLI management
├── Jobs/Story/
│   └── ProcessStoryFollowUpsJob.php    # Periodic processing job
├── Models/
│   ├── StoryThread.php                 # Main thread model
│   └── StoryModels.php                 # Article link, trigger, beat models
└── Services/Story/
    ├── StoryAnalysisService.php        # AI analysis
    ├── EngagementScoringService.php    # Engagement calculations
    └── StoryFollowUpService.php        # Orchestration

database/migrations/
└── 2025_01_22_000001_create_story_threads_tables.php
```

## Installation

1. Copy files to your Laravel project
2. Run migration: `php artisan migrate`
3. Add scheduling to Kernel.php
4. Test with: `php artisan story:threads analyze --article=<id>`

## Future Enhancements

- [ ] Integration with civic sources (court records, police reports)
- [ ] Automated news search for thread updates
- [ ] ML-based engagement prediction
- [ ] Reader subscription to story threads
- [ ] Push notifications for major developments
- [ ] Editorial dashboard with thread management
