# TASK-10-P9: Create Story Tracking Tables + StoryTrackingService

## Context

Follow-up stories require tracking active threads. When new content mentions entities from an active story, it auto-creates follow-ups. This transforms Day.News from one-shot articles into ongoing community coverage.

**Depends on:** TASK-09 (ContentRoutingService must be routing content).

---

## Objective

Create `story_threads` and `story_follow_ups` tables, their models, and a `StoryTrackingService` that monitors active threads and detects related content.

---

## Files to Create

### 1. CREATE: Migration

**File:** `database/migrations/2026_02_16_000003_create_story_tracking_tables.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('story_threads', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('region_id')->index();
            $table->string('title');
            $table->text('summary')->nullable();
            $table->string('primary_topic');
            $table->jsonb('topic_tags')->nullable();
            $table->string('status')->default('active'); // active|monitoring|resolved|archived
            $table->string('priority')->default('normal'); // critical|high|normal|low
            $table->uuid('original_article_id')->nullable();
            $table->jsonb('related_article_ids')->nullable();
            $table->jsonb('key_entities')->nullable(); // {people: [], businesses: [], organizations: []}
            $table->timestamp('last_development_at')->nullable();
            $table->timestamp('next_check_at')->nullable();
            $table->integer('auto_check_interval_hours')->default(168); // Weekly default
            $table->integer('follow_up_count')->default(0);
            $table->timestamps();

            $table->index(['status', 'next_check_at']);
            $table->index('primary_topic');
        });

        Schema::create('story_follow_ups', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('story_thread_id');
            $table->string('type'); // development|update|resolution|anniversary|related
            $table->string('trigger'); // auto_scheduled|new_content_detected|manual|community_tip
            $table->text('description')->nullable();
            $table->uuid('source_content_id')->nullable(); // FK to raw_content
            $table->uuid('generated_article_id')->nullable(); // FK to news articles
            $table->string('status')->default('pending'); // pending|in_progress|published|dismissed
            $table->timestamp('scheduled_for')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->foreign('story_thread_id')->references('id')->on('story_threads')->cascadeOnDelete();
            $table->index(['story_thread_id', 'status']);
            $table->index('scheduled_for');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('story_follow_ups');
        Schema::dropIfExists('story_threads');
    }
};
```

### 2. CREATE: StoryThread Model

**File:** `app/Models/StoryThread.php`

```php
<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class StoryThread extends Model
{
    use HasUuids;

    protected $fillable = [
        'region_id', 'title', 'summary', 'primary_topic', 'topic_tags',
        'status', 'priority', 'original_article_id', 'related_article_ids',
        'key_entities', 'last_development_at', 'next_check_at',
        'auto_check_interval_hours', 'follow_up_count',
    ];

    protected $casts = [
        'topic_tags' => 'array', 'related_article_ids' => 'array',
        'key_entities' => 'array',
        'last_development_at' => 'datetime', 'next_check_at' => 'datetime',
    ];

    public function followUps() { return $this->hasMany(StoryFollowUp::class); }
    public function region() { return $this->belongsTo(Region::class); }
    public function scopeActive($q) { return $q->where('status', 'active'); }
    public function scopeDueForCheck($q) { return $q->where('next_check_at', '<=', now()); }

    public function addRelatedArticle(string $articleId): void
    {
        $ids = $this->related_article_ids ?? [];
        if (!in_array($articleId, $ids)) {
            $ids[] = $articleId;
            $this->update([
                'related_article_ids' => $ids,
                'last_development_at' => now(),
                'next_check_at' => now()->addHours($this->auto_check_interval_hours),
            ]);
        }
    }
}
```

### 3. CREATE: StoryFollowUp Model

**File:** `app/Models/StoryFollowUp.php`

```php
<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class StoryFollowUp extends Model
{
    use HasUuids;

    protected $fillable = [
        'story_thread_id', 'type', 'trigger', 'description',
        'source_content_id', 'generated_article_id',
        'status', 'scheduled_for', 'completed_at',
    ];

    protected $casts = [
        'scheduled_for' => 'datetime', 'completed_at' => 'datetime',
    ];

    public function storyThread() { return $this->belongsTo(StoryThread::class); }
}
```

### 4. CREATE: StoryTrackingService

**File:** `app/Services/News/StoryTrackingService.php`

```php
<?php

declare(strict_types=1);

namespace App\Services\News;

use App\Models\RawContent;
use App\Models\StoryFollowUp;
use App\Models\StoryThread;
use Illuminate\Support\Facades\Log;

class StoryTrackingService
{
    /**
     * Create a story thread from a published article.
     */
    public function createThread(string $regionId, string $title, string $topic, array $entities, string $articleId, string $priority = 'normal'): StoryThread
    {
        return StoryThread::create([
            'region_id' => $regionId,
            'title' => $title,
            'primary_topic' => $topic,
            'key_entities' => $entities,
            'original_article_id' => $articleId,
            'related_article_ids' => [$articleId],
            'status' => 'active',
            'priority' => $priority,
            'last_development_at' => now(),
            'next_check_at' => now()->addHours(168),
        ]);
    }

    /**
     * Check if new content matches any active story thread.
     * Called by ContentRoutingService after routing content.
     */
    public function checkForRelatedContent(RawContent $raw): array
    {
        $matches = [];
        $entities = array_merge(
            array_column($raw->people_mentioned ?? [], 'name'),
            array_column($raw->businesses_mentioned ?? [], 'name'),
            array_column($raw->organizations_mentioned ?? [], 'name'),
        );

        if (empty($entities)) return $matches;

        $activeThreads = StoryThread::active()
            ->where('region_id', $raw->region_id)
            ->get();

        foreach ($activeThreads as $thread) {
            $threadEntities = array_merge(
                array_column($thread->key_entities['people'] ?? [], 'name'),
                array_column($thread->key_entities['businesses'] ?? [], 'name'),
                array_column($thread->key_entities['organizations'] ?? [], 'name'),
            );

            $overlap = array_intersect(
                array_map('strtolower', $entities),
                array_map('strtolower', $threadEntities)
            );

            if (!empty($overlap)) {
                $followUp = StoryFollowUp::create([
                    'story_thread_id' => $thread->id,
                    'type' => 'development',
                    'trigger' => 'new_content_detected',
                    'description' => "New content mentions: " . implode(', ', $overlap),
                    'source_content_id' => $raw->id,
                    'status' => 'pending',
                ]);

                $thread->increment('follow_up_count');
                $matches[] = ['thread' => $thread, 'follow_up' => $followUp, 'entities' => $overlap];

                Log::info('StoryTracking: Related content detected', [
                    'thread' => $thread->title,
                    'raw_content_id' => $raw->id,
                    'matching_entities' => $overlap,
                ]);
            }
        }

        return $matches;
    }

    /**
     * Process threads due for scheduled check-in.
     */
    public function processScheduledChecks(): int
    {
        $threads = StoryThread::active()->dueForCheck()->get();
        $processed = 0;

        foreach ($threads as $thread) {
            StoryFollowUp::create([
                'story_thread_id' => $thread->id,
                'type' => 'update',
                'trigger' => 'auto_scheduled',
                'description' => "Scheduled check-in for: {$thread->title}",
                'status' => 'pending',
                'scheduled_for' => now(),
            ]);

            $thread->update([
                'next_check_at' => now()->addHours($thread->auto_check_interval_hours),
            ]);

            $thread->increment('follow_up_count');
            $processed++;
        }

        return $processed;
    }
}
```

---

## Verification

```bash
php artisan migrate

php artisan tinker --execute="
    echo 'story_threads: ' . (Schema::hasTable('story_threads') ? 'YES' : 'NO') . PHP_EOL;
    echo 'story_follow_ups: ' . (Schema::hasTable('story_follow_ups') ? 'YES' : 'NO') . PHP_EOL;
    \$sts = app(\App\Services\News\StoryTrackingService::class);
    echo 'StoryTrackingService: OK' . PHP_EOL;
"
```
