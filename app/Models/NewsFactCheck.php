<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class NewsFactCheck extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'draft_id',
        'claim',
        'verification_result',
        'confidence_score',
        'sources',
        'scraped_evidence',
        'metadata',
    ];

    public function draft(): BelongsTo
    {
        return $this->belongsTo(NewsArticleDraft::class, 'draft_id');
    }

    public function scopeVerified($query)
    {
        return $query->where('verification_result', 'verified');
    }

    public function scopeUnverified($query)
    {
        return $query->where('verification_result', 'unverified');
    }

    public function scopeContradicted($query)
    {
        return $query->where('verification_result', 'contradicted');
    }

    public function scopeAboveConfidence($query, float $threshold)
    {
        return $query->where('confidence_score', '>=', $threshold);
    }

    public function scopeForDraft($query, string $draftId)
    {
        return $query->where('draft_id', $draftId);
    }

    public function isVerified(): bool
    {
        return $this->verification_result === 'verified';
    }

    public function isUnverified(): bool
    {
        return $this->verification_result === 'unverified';
    }

    public function isContradicted(): bool
    {
        return $this->verification_result === 'contradicted';
    }

    protected function casts(): array
    {
        return [
            'confidence_score' => 'decimal:2',
            'sources' => 'array',
            'scraped_evidence' => 'array',
            'metadata' => 'array',
        ];
    }
}
