# TASK-11-P10: Create Community Leaders/Quote Requests + ReporterOutreachService

## Context

The AI Reporter system identifies relevant community leaders for each article, generates personalized outreach, tracks responses, and enriches articles with real quotes. Every interaction also creates a CRM sales opportunity — leaders who engage are the warmest possible leads.

**Depends on:** TASK-10 (story tracking for ongoing coverage context).

---

## Objective

Create `community_leaders`, `quote_requests`, and `reporter_outreach_log` tables with models and `ReporterOutreachService`.

---

## Files to Create

### 1. CREATE: Migration

**File:** `database/migrations/2026_02_16_000004_create_reporter_outreach_tables.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('community_leaders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('region_id')->index();
            $table->string('name');
            $table->string('title')->nullable();
            $table->string('organization')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('preferred_contact_method')->default('email');
            $table->string('category'); // government_official|law_enforcement|business_leader|organization_leader|academic_expert
            $table->jsonb('expertise_topics')->nullable();
            $table->boolean('is_influencer')->default(false);
            $table->integer('influence_score')->default(50);
            $table->integer('times_contacted')->default(0);
            $table->integer('times_responded')->default(0);
            $table->decimal('avg_response_time_hours', 8, 2)->nullable();
            $table->timestamp('last_contacted_at')->nullable();
            $table->boolean('do_not_contact')->default(false);
            $table->timestamps();

            $table->index(['region_id', 'category']);
        });

        Schema::create('quote_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('leader_id');
            $table->uuid('news_article_draft_id')->nullable();
            $table->string('status')->default('pending'); // pending|sent|responded|declined|expired
            $table->string('contact_method');
            $table->text('context');
            $table->text('questions');
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->text('response')->nullable();
            $table->boolean('approved_for_publication')->default(false);
            $table->timestamps();

            $table->foreign('leader_id')->references('id')->on('community_leaders')->cascadeOnDelete();
            $table->index(['leader_id', 'status']);
        });

        Schema::create('reporter_outreach_log', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('leader_id');
            $table->uuid('quote_request_id')->nullable();
            $table->string('action'); // email_sent|email_opened|response_received|follow_up_sent|declined
            $table->jsonb('metadata')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('leader_id')->references('id')->on('community_leaders')->cascadeOnDelete();
            $table->index(['leader_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reporter_outreach_log');
        Schema::dropIfExists('quote_requests');
        Schema::dropIfExists('community_leaders');
    }
};
```

### 2. CREATE: CommunityLeader Model

**File:** `app/Models/CommunityLeader.php`

```php
<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class CommunityLeader extends Model
{
    use HasUuids;

    protected $fillable = [
        'region_id', 'name', 'title', 'organization', 'email', 'phone',
        'preferred_contact_method', 'category', 'expertise_topics',
        'is_influencer', 'influence_score', 'times_contacted', 'times_responded',
        'avg_response_time_hours', 'last_contacted_at', 'do_not_contact',
    ];

    protected $casts = [
        'expertise_topics' => 'array',
        'is_influencer' => 'boolean',
        'do_not_contact' => 'boolean',
        'last_contacted_at' => 'datetime',
    ];

    public function quoteRequests() { return $this->hasMany(QuoteRequest::class, 'leader_id'); }
    public function region() { return $this->belongsTo(Region::class); }
    public function scopeContactable($q) { return $q->where('do_not_contact', false)->whereNotNull('email'); }
    public function scopeByExpertise($q, string $topic) { return $q->whereJsonContains('expertise_topics', $topic); }

    public function getResponseRateAttribute(): float
    {
        if ($this->times_contacted === 0) return 0;
        return round(($this->times_responded / $this->times_contacted) * 100, 1);
    }
}
```

### 3. CREATE: QuoteRequest Model

**File:** `app/Models/QuoteRequest.php`

```php
<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class QuoteRequest extends Model
{
    use HasUuids;

    protected $fillable = [
        'leader_id', 'news_article_draft_id', 'status', 'contact_method',
        'context', 'questions', 'sent_at', 'responded_at', 'expires_at',
        'response', 'approved_for_publication',
    ];

    protected $casts = [
        'approved_for_publication' => 'boolean',
        'sent_at' => 'datetime', 'responded_at' => 'datetime', 'expires_at' => 'datetime',
    ];

    public function leader() { return $this->belongsTo(CommunityLeader::class, 'leader_id'); }
    public function scopePending($q) { return $q->where('status', 'pending'); }
}
```

### 4. CREATE: ReporterOutreachService

**File:** `app/Services/News/ReporterOutreachService.php`

```php
<?php

declare(strict_types=1);

namespace App\Services\News;

use App\Models\CommunityLeader;
use App\Models\QuoteRequest;
use App\Models\NewsArticleDraft;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ReporterOutreachService
{
    public function __construct(
        private readonly PrismAiService $aiService,
    ) {}

    /**
     * Find relevant leaders for an article and generate outreach.
     */
    public function seekSourcesForArticle(NewsArticleDraft $draft): array
    {
        $regionId = $draft->region_id;
        $topic = $draft->category ?? 'general';

        // Find leaders by topic expertise in this region
        $leaders = CommunityLeader::where('region_id', $regionId)
            ->contactable()
            ->where(function ($q) use ($topic) {
                $q->whereJsonContains('expertise_topics', $topic)
                    ->orWhere('category', 'government_official');
            })
            ->orderByDesc('influence_score')
            ->limit(3)
            ->get();

        $requests = [];
        foreach ($leaders as $leader) {
            $questions = $this->generateQuestions($draft, $leader);

            $request = QuoteRequest::create([
                'leader_id' => $leader->id,
                'news_article_draft_id' => $draft->id,
                'status' => 'pending',
                'contact_method' => $leader->preferred_contact_method,
                'context' => "Article: {$draft->title}",
                'questions' => $questions,
                'expires_at' => now()->addHours(48),
            ]);

            $requests[] = $request;

            Log::info('ReporterOutreach: Quote request created', [
                'leader' => $leader->name,
                'article' => $draft->title,
            ]);
        }

        return $requests;
    }

    private function generateQuestions(NewsArticleDraft $draft, CommunityLeader $leader): string
    {
        try {
            $prompt = "Generate 2-3 brief interview questions for {$leader->name} ({$leader->title} at {$leader->organization}) about: {$draft->title}. Keep questions concise and relevant to their expertise. Return just the questions, numbered.";

            return $this->aiService->chat(
                model: 'gpt-4o-mini',
                messages: [['role' => 'user', 'content' => $prompt]],
            );
        } catch (\Exception $e) {
            return "1. What is your perspective on this development?\n2. How does this affect the community?";
        }
    }
}
```

---

## Verification

```bash
php artisan migrate

php artisan tinker --execute="
    echo 'community_leaders: ' . (Schema::hasTable('community_leaders') ? 'YES' : 'NO') . PHP_EOL;
    echo 'quote_requests: ' . (Schema::hasTable('quote_requests') ? 'YES' : 'NO') . PHP_EOL;
    echo 'reporter_outreach_log: ' . (Schema::hasTable('reporter_outreach_log') ? 'YES' : 'NO') . PHP_EOL;
"
```
