<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class EventExtractionDraft extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'news_article_id',
        'region_id',
        'status',
        'detection_confidence',
        'extraction_confidence',
        'quality_score',
        'extracted_data',
        'matched_venue_id',
        'matched_performer_id',
        'published_event_id',
        'ai_metadata',
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

    public function matchedVenue(): BelongsTo
    {
        return $this->belongsTo(Venue::class, 'matched_venue_id');
    }

    public function matchedPerformer(): BelongsTo
    {
        return $this->belongsTo(Performer::class, 'matched_performer_id');
    }

    public function publishedEvent(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'published_event_id');
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeDetected($query)
    {
        return $query->where('status', 'detected');
    }

    public function scopeExtracted($query)
    {
        return $query->where('status', 'extracted');
    }

    public function scopeValidated($query)
    {
        return $query->where('status', 'validated');
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
        $threshold = config('news-workflow.event_extraction.auto_publish_threshold', 85);

        return $this->quality_score >= $threshold;
    }

    protected function casts(): array
    {
        return [
            'detection_confidence' => 'decimal:2',
            'extraction_confidence' => 'decimal:2',
            'quality_score' => 'decimal:2',
            'extracted_data' => 'array',
            'ai_metadata' => 'array',
        ];
    }
}
