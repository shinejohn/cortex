<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

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
