<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

final class RawContent extends Model
{
    use HasUuids;

    public const CLASS_PENDING = 'pending';

    public const CLASS_CLASSIFIED = 'classified';

    public const CLASS_FAILED = 'failed';

    public const PROC_PENDING = 'pending';

    public const PROC_COMPLETED = 'completed';

    public const PROC_FAILED = 'failed';

    public const PROC_SKIPPED = 'skipped';

    public const TIER_BRIEF = 'brief';

    public const TIER_STANDARD = 'standard';

    public const TIER_FULL = 'full';

    public const PRIORITY_BREAKING = 'breaking';

    public const PRIORITY_HIGH = 'high';

    public const PRIORITY_NORMAL = 'normal';

    public const PRIORITY_LOW = 'low';

    protected $table = 'raw_content';

    protected $fillable = [
        'source_id', 'collection_method_id', 'community_id', 'region_id',
        'source_url', 'source_title', 'source_content', 'source_excerpt', 'source_html',
        'source_published_at', 'source_author', 'source_images',
        'content_hash', 'title_hash', 'collected_at', 'collection_method', 'raw_metadata',
        'email_from', 'email_subject', 'incoming_email_id',
        'classification_status', 'classified_at', 'classification_error', 'classification_model',
        'content_types', 'primary_type', 'categories', 'tags',
        'businesses_mentioned', 'people_mentioned', 'locations_mentioned', 'organizations_mentioned', 'dates_mentioned',
        'has_event', 'event_data',
        'local_relevance_score', 'local_relevance_reason', 'news_value_score', 'news_value_reason',
        'processing_tier', 'priority', 'processing_recommendation', 'suggested_headline',
        'processing_status', 'processed_at', 'processing_error', 'skip_reason',
        'output_ids', 'article_id', 'event_id', 'has_sales_opportunity', 'sales_flag', 'was_published',
    ];

    protected $casts = [
        'source_images' => 'array', 'raw_metadata' => 'array', 'content_types' => 'array',
        'categories' => 'array', 'tags' => 'array', 'businesses_mentioned' => 'array',
        'people_mentioned' => 'array', 'locations_mentioned' => 'array', 'organizations_mentioned' => 'array',
        'dates_mentioned' => 'array', 'event_data' => 'array', 'processing_recommendation' => 'array',
        'output_ids' => 'array', 'sales_flag' => 'array',
        'has_event' => 'boolean', 'has_sales_opportunity' => 'boolean', 'was_published' => 'boolean',
        'source_published_at' => 'datetime', 'collected_at' => 'datetime', 'classified_at' => 'datetime', 'processed_at' => 'datetime',
    ];

    public static function generateContentHash(string $title, ?string $url = null): string
    {
        return hash('sha256', mb_trim(mb_strtolower($title)).'|'.($url ?? ''));
    }

    public static function generateTitleHash(string $title): string
    {
        return hash('sha256', mb_trim(mb_strtolower($title)));
    }

    public static function isDuplicate(string $hash, string $communityId): bool
    {
        return self::where('content_hash', $hash)->where('community_id', $communityId)->exists();
    }

    public function source()
    {
        return $this->belongsTo(NewsSource::class, 'source_id');
    }

    public function collectionMethod()
    {
        return $this->belongsTo(CollectionMethod::class, 'collection_method_id');
    }

    public function community()
    {
        return $this->belongsTo(Community::class);
    }

    public function article()
    {
        return $this->belongsTo(NewsArticleDraft::class, 'article_id');
    }

    public function businessMentions()
    {
        return $this->hasMany(BusinessMention::class, 'raw_content_id');
    }

    public function scopePendingClassification($q)
    {
        return $q->where('classification_status', self::CLASS_PENDING);
    }

    public function scopeClassified($q)
    {
        return $q->where('classification_status', self::CLASS_CLASSIFIED);
    }

    public function scopePendingProcessing($q)
    {
        return $q->where('classification_status', self::CLASS_CLASSIFIED)->where('processing_status', self::PROC_PENDING);
    }

    public function scopeByTier($q, $t)
    {
        return $q->where('processing_tier', $t);
    }

    public function scopeBreaking($q)
    {
        return $q->where('priority', self::PRIORITY_BREAKING);
    }

    public function scopeHasEvent($q)
    {
        return $q->where('has_event', true);
    }

    public function markClassified(array $c): void
    {
        $this->update([
            'classification_status' => self::CLASS_CLASSIFIED, 'classified_at' => now(),
            'content_types' => $c['content_types'] ?? null, 'primary_type' => $c['primary_type'] ?? null,
            'categories' => $c['categories'] ?? null, 'tags' => $c['tags'] ?? null,
            'businesses_mentioned' => $c['businesses_mentioned'] ?? null,
            'people_mentioned' => $c['people_mentioned'] ?? null,
            'locations_mentioned' => $c['locations_mentioned'] ?? null,
            'organizations_mentioned' => $c['organizations_mentioned'] ?? null,
            'dates_mentioned' => $c['dates_mentioned'] ?? null,
            'has_event' => ! empty($c['event_data']['is_event']), 'event_data' => $c['event_data'] ?? null,
            'local_relevance_score' => $c['local_relevance_score'] ?? null,
            'local_relevance_reason' => $c['local_relevance_reason'] ?? null,
            'news_value_score' => $c['news_value_score'] ?? null,
            'news_value_reason' => $c['news_value_reason'] ?? null,
            'processing_tier' => $c['processing_recommendation']['tier'] ?? self::TIER_STANDARD,
            'priority' => $c['processing_recommendation']['priority'] ?? self::PRIORITY_NORMAL,
            'processing_recommendation' => $c['processing_recommendation'] ?? null,
            'suggested_headline' => $c['processing_recommendation']['suggested_headline'] ?? null,
            'has_sales_opportunity' => ! empty($c['sales_flag']['has_business_opportunity']),
            'sales_flag' => $c['sales_flag'] ?? null,
        ]);
    }

    public function markClassificationFailed(string $error): void
    {
        $this->update(['classification_status' => self::CLASS_FAILED, 'classification_error' => $error]);
    }

    public function markProcessed(array $outputs = []): void
    {
        $this->update([
            'processing_status' => self::PROC_COMPLETED, 'processed_at' => now(),
            'output_ids' => $outputs, 'article_id' => $outputs['article_id'] ?? null, 'event_id' => $outputs['event_id'] ?? null,
        ]);
    }

    public function markSkipped(string $reason): void
    {
        $this->update(['processing_status' => self::PROC_SKIPPED, 'skip_reason' => $reason, 'processed_at' => now()]);
    }

    public function isBreaking(): bool
    {
        return $this->priority === self::PRIORITY_BREAKING || in_array('breaking_news', $this->content_types ?? []);
    }
}
