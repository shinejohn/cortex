<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class NewsArticleDraft extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'news_article_id',
        'region_id',
        'status',
        'relevance_score',
        'quality_score',
        'fact_check_confidence',
        'topic_tags',
        'outline',
        'generated_title',
        'generated_content',
        'generated_excerpt',
        'seo_metadata',
        'featured_image_url',
        'featured_image_path',
        'featured_image_disk',
        'ai_metadata',
        'published_post_id',
        'rejection_reason',
    ];

    public function newsArticle(): BelongsTo
    {
        return $this->belongsTo(NewsArticle::class);
    }

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    public function publishedPost(): BelongsTo
    {
        return $this->belongsTo(DayNewsPost::class, 'published_post_id');
    }

    public function factChecks(): HasMany
    {
        return $this->hasMany(NewsFactCheck::class, 'draft_id');
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopeShortlisted($query)
    {
        return $query->where('status', 'shortlisted');
    }

    public function scopeOutlineGenerated($query)
    {
        return $query->where('status', 'outline_generated');
    }

    public function scopeReadyForGeneration($query)
    {
        return $query->where('status', 'ready_for_generation');
    }

    public function scopeReadyForPublishing($query)
    {
        return $query->where('status', 'ready_for_publishing');
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    public function scopeForRegion($query, string $regionId)
    {
        return $query->where('region_id', $regionId);
    }

    public function scopeAboveQualityThreshold($query, float $threshold)
    {
        return $query->where('quality_score', '>=', $threshold);
    }

    public function shouldAutoPublish(): bool
    {
        $threshold = config('news-workflow.publishing.auto_publish_threshold', 85);

        return $this->quality_score >= $threshold;
    }

    public function calculateAverageFactCheckConfidence(): void
    {
        $avg = $this->factChecks()->avg('confidence_score');

        $this->update(['fact_check_confidence' => $avg]);
    }

    public function getFeaturedImageUrlAttribute(): ?string
    {
        // Priority: local storage > original URL > null
        if ($this->featured_image_path && $this->featured_image_disk) {
            return \Illuminate\Support\Facades\Storage::disk($this->featured_image_disk)->url($this->featured_image_path);
        }

        return $this->attributes['featured_image_url'] ?? null;
    }

    protected function casts(): array
    {
        return [
            'relevance_score' => 'decimal:2',
            'quality_score' => 'decimal:2',
            'fact_check_confidence' => 'decimal:2',
            'topic_tags' => 'array',
            'seo_metadata' => 'array',
            'ai_metadata' => 'array',
        ];
    }
}
