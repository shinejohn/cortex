<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Links articles to story threads with metadata about their role in the narrative
 */
class StoryThreadArticle extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'story_thread_id',
        'news_article_id',
        'sequence_number',
        'narrative_role',
        'contribution_summary',
        'views_at_link',
        'comments_at_link',
        'engagement_score',
    ];

    protected $casts = [
        'sequence_number' => 'integer',
        'views_at_link' => 'integer',
        'comments_at_link' => 'integer',
        'engagement_score' => 'decimal:2',
    ];

    // Narrative roles
    public const ROLE_ORIGIN = 'origin';           // First article, introduces the story
    public const ROLE_DEVELOPMENT = 'development'; // Major development/update
    public const ROLE_UPDATE = 'update';           // Minor update
    public const ROLE_BACKGROUND = 'background';   // Context/explainer
    public const ROLE_RESOLUTION = 'resolution';   // Story concludes
    public const ROLE_FOLLOWUP = 'followup';       // Follow-up after resolution

    public function storyThread(): BelongsTo
    {
        return $this->belongsTo(StoryThread::class);
    }

    public function article(): BelongsTo
    {
        return $this->belongsTo(NewsArticle::class, 'news_article_id');
    }

    /**
     * Check if this is the origin article
     */
    public function isOrigin(): bool
    {
        return $this->narrative_role === self::ROLE_ORIGIN;
    }

    /**
     * Check if this is the resolution
     */
    public function isResolution(): bool
    {
        return $this->narrative_role === self::ROLE_RESOLUTION;
    }
}


/**
 * Story Follow-Up Trigger
 * 
 * Defines conditions under which a follow-up article should be created
 */
class StoryFollowUpTrigger extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'story_thread_id',
        'trigger_type',
        'conditions',
        'status',
        'check_at',
        'expires_at',
        'check_count',
        'max_checks',
        'triggered_at',
        'trigger_reason',
        'trigger_data',
        'resulting_article_id',
        'action_taken',
    ];

    protected $casts = [
        'conditions' => 'array',
        'trigger_data' => 'array',
        'check_at' => 'datetime',
        'expires_at' => 'datetime',
        'triggered_at' => 'datetime',
        'check_count' => 'integer',
        'max_checks' => 'integer',
    ];

    // Trigger types
    public const TYPE_TIME_BASED = 'time_based';
    public const TYPE_ENGAGEMENT = 'engagement_threshold';
    public const TYPE_DATE_EVENT = 'date_event';
    public const TYPE_EXTERNAL = 'external_update';
    public const TYPE_RESOLUTION = 'resolution_check';
    public const TYPE_SCHEDULED = 'scheduled_search';

    // Status values
    public const STATUS_PENDING = 'pending';
    public const STATUS_TRIGGERED = 'triggered';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_EXPIRED = 'expired';
    public const STATUS_CANCELLED = 'cancelled';

    public function storyThread(): BelongsTo
    {
        return $this->belongsTo(StoryThread::class);
    }

    public function resultingArticle(): BelongsTo
    {
        return $this->belongsTo(NewsArticle::class, 'resulting_article_id');
    }

    // =========================================================================
    // SCOPES
    // =========================================================================

    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeDueForCheck($query)
    {
        return $query->pending()
            ->where('check_at', '<=', now())
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            });
    }

    public function scopeTriggered($query)
    {
        return $query->where('status', self::STATUS_TRIGGERED);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('trigger_type', $type);
    }

    // =========================================================================
    // ACTIONS
    // =========================================================================

    /**
     * Check if this trigger should fire
     */
    public function shouldTrigger(): bool
    {
        if ($this->status !== self::STATUS_PENDING) {
            return false;
        }

        if ($this->expires_at && $this->expires_at->lt(now())) {
            return false;
        }

        if ($this->max_checks && $this->check_count >= $this->max_checks) {
            return false;
        }

        return true;
    }

    /**
     * Mark as triggered
     */
    public function markTriggered(string $reason, ?array $data = null): void
    {
        $this->update([
            'status' => self::STATUS_TRIGGERED,
            'triggered_at' => now(),
            'trigger_reason' => $reason,
            'trigger_data' => $data,
        ]);
    }

    /**
     * Mark as completed
     */
    public function markCompleted(?string $articleId = null, ?string $actionTaken = null): void
    {
        $this->update([
            'status' => self::STATUS_COMPLETED,
            'resulting_article_id' => $articleId,
            'action_taken' => $actionTaken,
        ]);
    }

    /**
     * Mark as expired
     */
    public function markExpired(): void
    {
        $this->update(['status' => self::STATUS_EXPIRED]);
    }

    /**
     * Increment check count and reschedule
     */
    public function recordCheck(?\DateTime $nextCheck = null): void
    {
        $this->increment('check_count');

        if ($nextCheck) {
            $this->update(['check_at' => $nextCheck]);
        }
    }

    /**
     * Get condition value
     */
    public function getCondition(string $key, $default = null)
    {
        return $this->conditions[$key] ?? $default;
    }
}


/**
 * Story Beat
 * 
 * Represents a predicted or actual development in a story's narrative arc
 */
class StoryBeat extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'story_thread_id',
        'title',
        'description',
        'sequence',
        'status',
        'predicted_date',
        'expected_date',
        'occurred_at',
        'likelihood',
        'source',
        'news_article_id',
    ];

    protected $casts = [
        'sequence' => 'integer',
        'predicted_date' => 'date',
        'expected_date' => 'date',
        'occurred_at' => 'datetime',
        'likelihood' => 'decimal:2',
    ];

    // Beat statuses
    public const STATUS_PREDICTED = 'predicted';
    public const STATUS_EXPECTED = 'expected';
    public const STATUS_OCCURRED = 'occurred';
    public const STATUS_SKIPPED = 'skipped';

    public function storyThread(): BelongsTo
    {
        return $this->belongsTo(StoryThread::class);
    }

    public function article(): BelongsTo
    {
        return $this->belongsTo(NewsArticle::class, 'news_article_id');
    }

    // =========================================================================
    // SCOPES
    // =========================================================================

    public function scopePredicted($query)
    {
        return $query->where('status', self::STATUS_PREDICTED);
    }

    public function scopeExpected($query)
    {
        return $query->where('status', self::STATUS_EXPECTED);
    }

    public function scopeOccurred($query)
    {
        return $query->where('status', self::STATUS_OCCURRED);
    }

    public function scopeUpcoming($query)
    {
        return $query->whereIn('status', [self::STATUS_PREDICTED, self::STATUS_EXPECTED])
            ->orderBy('predicted_date');
    }

    public function scopeHighLikelihood($query, float $threshold = 70)
    {
        return $query->where('likelihood', '>=', $threshold);
    }

    // =========================================================================
    // ACTIONS
    // =========================================================================

    /**
     * Mark this beat as occurred
     */
    public function markOccurred(?string $articleId = null): void
    {
        $this->update([
            'status' => self::STATUS_OCCURRED,
            'occurred_at' => now(),
            'news_article_id' => $articleId,
        ]);
    }

    /**
     * Mark as skipped (didn't happen)
     */
    public function markSkipped(): void
    {
        $this->update(['status' => self::STATUS_SKIPPED]);
    }

    /**
     * Confirm with expected date
     */
    public function confirmExpected(\DateTime $date): void
    {
        $this->update([
            'status' => self::STATUS_EXPECTED,
            'expected_date' => $date,
            'likelihood' => 100,
        ]);
    }

    /**
     * Check if this beat is overdue
     */
    public function isOverdue(): bool
    {
        if (!$this->predicted_date && !$this->expected_date) {
            return false;
        }

        $dueDate = $this->expected_date ?? $this->predicted_date;
        return $dueDate->lt(now()) && in_array($this->status, [
            self::STATUS_PREDICTED,
            self::STATUS_EXPECTED,
        ]);
    }
}
