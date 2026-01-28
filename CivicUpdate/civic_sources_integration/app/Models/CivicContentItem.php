<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Civic Content Item Model
 * 
 * Represents raw collected content from civic sources before processing
 */
class CivicContentItem extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'civic_source_id',
        'region_id',
        'content_type',
        'external_id',
        'title',
        'description',
        'full_content',
        'url',
        'published_at',
        'event_date',
        'expires_at',
        'category',
        'subcategory',
        'tags',
        'body_name',
        'meeting_type',
        'agenda_items',
        'attachments',
        'alert_type',
        'urgency',
        'severity',
        'raw_data',
        'content_hash',
        'processing_status',
        'news_article_id',
        'event_id',
        'processed_at',
    ];

    protected $casts = [
        'tags' => 'array',
        'agenda_items' => 'array',
        'attachments' => 'array',
        'raw_data' => 'array',
        'published_at' => 'datetime',
        'event_date' => 'datetime',
        'expires_at' => 'datetime',
        'processed_at' => 'datetime',
    ];

    /**
     * Content types
     */
    public const TYPE_MEETING = 'meeting';
    public const TYPE_AGENDA = 'agenda';
    public const TYPE_MATTER = 'matter';
    public const TYPE_ALERT = 'alert';
    public const TYPE_ADVISORY = 'advisory';
    public const TYPE_COMMUNITY = 'community';
    public const TYPE_EVENT = 'event';
    public const TYPE_NEWS = 'news';

    /**
     * Processing statuses
     */
    public const STATUS_PENDING = 'pending';
    public const STATUS_PROCESSED = 'processed';
    public const STATUS_SKIPPED = 'skipped';
    public const STATUS_FAILED = 'failed';

    /**
     * Categories
     */
    public const CATEGORY_GOVERNMENT = 'government';
    public const CATEGORY_PUBLIC_SAFETY = 'public_safety';
    public const CATEGORY_COMMUNITY = 'community';
    public const CATEGORY_EDUCATION = 'education';
    public const CATEGORY_TRANSPORTATION = 'transportation';
    public const CATEGORY_UTILITIES = 'utilities';

    /**
     * Get the civic source
     */
    public function civicSource(): BelongsTo
    {
        return $this->belongsTo(CivicSource::class);
    }

    /**
     * Get the region
     */
    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    /**
     * Get the generated news article (if any)
     */
    public function newsArticle(): BelongsTo
    {
        return $this->belongsTo(NewsArticle::class);
    }

    /**
     * Scope to pending items
     */
    public function scopePending($query)
    {
        return $query->where('processing_status', self::STATUS_PENDING);
    }

    /**
     * Scope to processed items
     */
    public function scopeProcessed($query)
    {
        return $query->where('processing_status', self::STATUS_PROCESSED);
    }

    /**
     * Scope to items by content type
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('content_type', $type);
    }

    /**
     * Scope to items by region
     */
    public function scopeForRegion($query, $region)
    {
        $regionId = $region instanceof Region ? $region->id : $region;
        return $query->where('region_id', $regionId);
    }

    /**
     * Scope to recent items
     */
    public function scopeRecent($query, int $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    /**
     * Scope to alerts and advisories (time-sensitive)
     */
    public function scopeAlerts($query)
    {
        return $query->whereIn('content_type', [self::TYPE_ALERT, self::TYPE_ADVISORY]);
    }

    /**
     * Scope to meetings and agendas
     */
    public function scopeMeetings($query)
    {
        return $query->whereIn('content_type', [self::TYPE_MEETING, self::TYPE_AGENDA]);
    }

    /**
     * Generate content hash
     */
    public static function generateHash(string $title, ?string $url = null, ?string $externalId = null): string
    {
        $content = $title . '|' . ($url ?? '') . '|' . ($externalId ?? '');
        return hash('sha256', $content);
    }

    /**
     * Check if item already exists
     */
    public static function isDuplicate(string $contentHash, $civicSource): bool
    {
        $sourceId = $civicSource instanceof CivicSource ? $civicSource->id : $civicSource;
        
        return static::where('content_hash', $contentHash)
            ->where('civic_source_id', $sourceId)
            ->exists();
    }

    /**
     * Mark as processed
     */
    public function markProcessed(?string $newsArticleId = null, ?string $eventId = null): void
    {
        $this->update([
            'processing_status' => self::STATUS_PROCESSED,
            'processed_at' => now(),
            'news_article_id' => $newsArticleId,
            'event_id' => $eventId,
        ]);
    }

    /**
     * Mark as skipped
     */
    public function markSkipped(): void
    {
        $this->update([
            'processing_status' => self::STATUS_SKIPPED,
            'processed_at' => now(),
        ]);
    }

    /**
     * Mark as failed
     */
    public function markFailed(): void
    {
        $this->update([
            'processing_status' => self::STATUS_FAILED,
            'processed_at' => now(),
        ]);
    }

    /**
     * Check if this is a high-priority alert
     */
    public function isHighPriority(): bool
    {
        if ($this->content_type === self::TYPE_ALERT) {
            return in_array($this->urgency, ['Immediate', 'Expected']) ||
                   in_array($this->severity, ['Extreme', 'Severe']);
        }

        return false;
    }

    /**
     * Check if content is still valid (not expired)
     */
    public function isValid(): bool
    {
        if ($this->expires_at === null) {
            return true;
        }

        return $this->expires_at->isFuture();
    }

    /**
     * Get a summary for news generation
     */
    public function getSummary(): string
    {
        if (!empty($this->description)) {
            return $this->description;
        }

        if (!empty($this->full_content)) {
            return \Illuminate\Support\Str::limit($this->full_content, 500);
        }

        return $this->title;
    }
}
