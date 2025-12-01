<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class NewsArticle extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'region_id',
        'business_id',
        'source_type',
        'source_name',
        'title',
        'url',
        'content_snippet',
        'full_content',
        'source_publisher',
        'published_at',
        'metadata',
        'content_hash',
        'processed',
        'relevance_score',
        'relevance_topic_tags',
        'relevance_rationale',
        'scored_at',
    ];

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function drafts(): HasMany
    {
        return $this->hasMany(NewsArticleDraft::class);
    }

    public function eventExtractionDrafts(): HasMany
    {
        return $this->hasMany(EventExtractionDraft::class);
    }

    public function scopeUnprocessed($query)
    {
        return $query->where('processed', false);
    }

    public function scopeProcessed($query)
    {
        return $query->where('processed', true);
    }

    public function scopeForRegion($query, string $regionId)
    {
        return $query->where('region_id', $regionId);
    }

    public function scopeForBusiness($query, string $businessId)
    {
        return $query->where('business_id', $businessId);
    }

    public function scopeBySourceType($query, string $sourceType)
    {
        return $query->where('source_type', $sourceType);
    }

    public function scopeScored($query)
    {
        return $query->whereNotNull('relevance_score');
    }

    public function scopeUnscored($query)
    {
        return $query->whereNull('relevance_score');
    }

    public function markAsProcessed(): void
    {
        $this->update(['processed' => true]);
    }

    public function isScored(): bool
    {
        return $this->relevance_score !== null;
    }

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'processed' => 'boolean',
            'published_at' => 'datetime',
            'relevance_topic_tags' => 'array',
            'scored_at' => 'datetime',
        ];
    }
}
