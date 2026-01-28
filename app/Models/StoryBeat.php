<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

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
