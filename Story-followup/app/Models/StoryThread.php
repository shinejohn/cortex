<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

/**
 * Story Thread Model
 * 
 * Represents an ongoing story that spans multiple articles.
 * Examples: Missing person case, court trial, election, ongoing investigation
 */
class StoryThread extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'region_id',
        'title',
        'slug',
        'summary',
        'category',
        'subcategory',
        'tags',
        'priority',
        'status',
        'is_resolved',
        'resolution_type',
        'resolution_summary',
        'resolved_at',
        'key_people',
        'key_organizations',
        'key_locations',
        'key_dates',
        'predicted_beats',
        'monitoring_keywords',
        'total_articles',
        'total_views',
        'total_comments',
        'total_shares',
        'avg_engagement_score',
        'first_article_at',
        'last_article_at',
        'last_development_at',
        'next_check_at',
    ];

    protected $casts = [
        'tags' => 'array',
        'key_people' => 'array',
        'key_organizations' => 'array',
        'key_locations' => 'array',
        'key_dates' => 'array',
        'predicted_beats' => 'array',
        'monitoring_keywords' => 'array',
        'is_resolved' => 'boolean',
        'resolved_at' => 'datetime',
        'first_article_at' => 'datetime',
        'last_article_at' => 'datetime',
        'last_development_at' => 'datetime',
        'next_check_at' => 'datetime',
        'avg_engagement_score' => 'decimal:2',
    ];

    // Priority levels
    public const PRIORITY_CRITICAL = 'critical';
    public const PRIORITY_HIGH = 'high';
    public const PRIORITY_MEDIUM = 'medium';
    public const PRIORITY_LOW = 'low';

    // Status values
    public const STATUS_DEVELOPING = 'developing';
    public const STATUS_MONITORING = 'monitoring';
    public const STATUS_RESOLVED = 'resolved';
    public const STATUS_DORMANT = 'dormant';
    public const STATUS_ARCHIVED = 'archived';

    // Resolution types
    public const RESOLUTION_NATURAL = 'natural';           // Story concluded naturally
    public const RESOLUTION_VERDICT = 'verdict';           // Legal verdict reached
    public const RESOLUTION_FOUND = 'found';               // Missing person/item found
    public const RESOLUTION_ABANDONED = 'abandoned';       // Search/investigation ended
    public const RESOLUTION_SETTLED = 'settled';           // Legal settlement
    public const RESOLUTION_ELECTION = 'election';         // Election concluded
    public const RESOLUTION_POLICY = 'policy';             // Policy enacted/rejected
    public const RESOLUTION_FADED = 'faded';               // Story lost relevance

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($thread) {
            if (empty($thread->slug)) {
                $thread->slug = Str::slug($thread->title) . '-' . Str::random(6);
            }
        });
    }

    // =========================================================================
    // RELATIONSHIPS
    // =========================================================================

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    public function articles(): BelongsToMany
    {
        return $this->belongsToMany(NewsArticle::class, 'story_thread_articles')
            ->withPivot(['sequence_number', 'narrative_role', 'contribution_summary', 'engagement_score'])
            ->withTimestamps()
            ->orderBy('sequence_number');
    }

    public function threadArticles(): HasMany
    {
        return $this->hasMany(StoryThreadArticle::class)->orderBy('sequence_number');
    }

    public function triggers(): HasMany
    {
        return $this->hasMany(StoryFollowUpTrigger::class);
    }

    public function pendingTriggers(): HasMany
    {
        return $this->hasMany(StoryFollowUpTrigger::class)
            ->where('status', 'pending');
    }

    public function beats(): HasMany
    {
        return $this->hasMany(StoryBeat::class)->orderBy('sequence');
    }

    public function predictedBeats(): HasMany
    {
        return $this->hasMany(StoryBeat::class)
            ->whereIn('status', ['predicted', 'expected'])
            ->orderBy('sequence');
    }

    // =========================================================================
    // SCOPES
    // =========================================================================

    public function scopeActive($query)
    {
        return $query->whereIn('status', [self::STATUS_DEVELOPING, self::STATUS_MONITORING]);
    }

    public function scopeDeveloping($query)
    {
        return $query->where('status', self::STATUS_DEVELOPING);
    }

    public function scopeNeedsFollowUp($query)
    {
        return $query->active()
            ->where('next_check_at', '<=', now())
            ->orderBy('priority')
            ->orderBy('next_check_at');
    }

    public function scopeHighEngagement($query, float $threshold = 80)
    {
        return $query->where('avg_engagement_score', '>=', $threshold);
    }

    public function scopeForRegion($query, $region)
    {
        $regionId = $region instanceof Region ? $region->id : $region;
        return $query->where('region_id', $regionId);
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    public function scopeUnresolved($query)
    {
        return $query->where('is_resolved', false);
    }

    public function scopeStale($query, int $days = 7)
    {
        return $query->where('last_article_at', '<', now()->subDays($days))
            ->where('is_resolved', false);
    }

    // =========================================================================
    // COMPUTED PROPERTIES
    // =========================================================================

    /**
     * Get days since last article
     */
    public function getDaysSinceLastArticleAttribute(): ?int
    {
        if (!$this->last_article_at) {
            return null;
        }
        return (int) $this->last_article_at->diffInDays(now());
    }

    /**
     * Get story duration in days
     */
    public function getDurationDaysAttribute(): ?int
    {
        if (!$this->first_article_at) {
            return null;
        }
        $end = $this->resolved_at ?? now();
        return (int) $this->first_article_at->diffInDays($end);
    }

    /**
     * Check if story is stale (no updates for X days)
     */
    public function isStale(int $days = 7): bool
    {
        return !$this->is_resolved 
            && $this->last_article_at 
            && $this->last_article_at->lt(now()->subDays($days));
    }

    /**
     * Check if story has high engagement
     */
    public function hasHighEngagement(float $threshold = 80): bool
    {
        return $this->avg_engagement_score >= $threshold;
    }

    /**
     * Get follow-up priority score (higher = more urgent)
     */
    public function getFollowUpPriorityScoreAttribute(): float
    {
        $score = 0;

        // Base priority
        $priorityScores = [
            self::PRIORITY_CRITICAL => 100,
            self::PRIORITY_HIGH => 75,
            self::PRIORITY_MEDIUM => 50,
            self::PRIORITY_LOW => 25,
        ];
        $score += $priorityScores[$this->priority] ?? 50;

        // Engagement boost
        $score += min($this->avg_engagement_score, 50);

        // Recency boost (newer = higher priority)
        if ($this->last_article_at) {
            $daysSince = $this->days_since_last_article;
            if ($daysSince <= 1) $score += 30;
            elseif ($daysSince <= 3) $score += 20;
            elseif ($daysSince <= 7) $score += 10;
        }

        // Article count boost (ongoing stories)
        $score += min($this->total_articles * 5, 25);

        return min($score, 200);
    }

    // =========================================================================
    // ACTIONS
    // =========================================================================

    /**
     * Add an article to this thread
     */
    public function addArticle(
        NewsArticle $article,
        string $narrativeRole = 'update',
        ?string $contributionSummary = null
    ): StoryThreadArticle {
        $nextSequence = $this->threadArticles()->max('sequence_number') + 1;

        $threadArticle = StoryThreadArticle::create([
            'story_thread_id' => $this->id,
            'news_article_id' => $article->id,
            'sequence_number' => $nextSequence,
            'narrative_role' => $narrativeRole,
            'contribution_summary' => $contributionSummary,
            'views_at_link' => $article->views ?? 0,
            'comments_at_link' => $article->comments_count ?? 0,
            'engagement_score' => $article->engagement_score ?? 0,
        ]);

        // Update thread stats
        $this->updateStats();

        return $threadArticle;
    }

    /**
     * Update aggregate statistics
     */
    public function updateStats(): void
    {
        $articles = $this->articles()->get();

        $this->update([
            'total_articles' => $articles->count(),
            'total_views' => $articles->sum('views'),
            'total_comments' => $articles->sum('comments_count'),
            'total_shares' => $articles->sum('shares'),
            'avg_engagement_score' => $articles->avg('engagement_score') ?? 0,
            'first_article_at' => $articles->min('published_at'),
            'last_article_at' => $articles->max('published_at'),
            'last_development_at' => now(),
        ]);
    }

    /**
     * Mark as resolved
     */
    public function markResolved(string $resolutionType, ?string $summary = null): void
    {
        $this->update([
            'status' => self::STATUS_RESOLVED,
            'is_resolved' => true,
            'resolution_type' => $resolutionType,
            'resolution_summary' => $summary,
            'resolved_at' => now(),
        ]);

        // Expire pending triggers
        $this->triggers()
            ->where('status', 'pending')
            ->update(['status' => 'expired']);
    }

    /**
     * Schedule next check
     */
    public function scheduleNextCheck(int $daysFromNow = 3): void
    {
        $this->update([
            'next_check_at' => now()->addDays($daysFromNow),
        ]);
    }

    /**
     * Add a predicted story beat
     */
    public function addPredictedBeat(
        string $title,
        ?string $description = null,
        ?string $predictedDate = null,
        float $likelihood = 50
    ): StoryBeat {
        $nextSequence = $this->beats()->max('sequence') + 1;

        return StoryBeat::create([
            'story_thread_id' => $this->id,
            'title' => $title,
            'description' => $description,
            'sequence' => $nextSequence,
            'status' => 'predicted',
            'predicted_date' => $predictedDate,
            'likelihood' => $likelihood,
            'source' => 'ai_prediction',
        ]);
    }

    /**
     * Create a follow-up trigger
     */
    public function createTrigger(
        string $type,
        array $conditions,
        ?\DateTime $checkAt = null,
        ?\DateTime $expiresAt = null
    ): StoryFollowUpTrigger {
        return StoryFollowUpTrigger::create([
            'story_thread_id' => $this->id,
            'trigger_type' => $type,
            'conditions' => $conditions,
            'status' => 'pending',
            'check_at' => $checkAt ?? now()->addDay(),
            'expires_at' => $expiresAt,
        ]);
    }
}
