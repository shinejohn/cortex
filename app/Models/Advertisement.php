<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

final class Advertisement extends Model
{
    /** @use HasFactory<\Database\Factories\AdvertisementFactory> */
    use \App\Traits\RelatableToOrganizations, HasFactory;

    protected $fillable = [
        'platform',
        'advertable_type',
        'advertable_id',
        'placement',
        'regions',
        'type',
        'external_code',
        'config',
        'impressions_count',
        'clicks_count',
        'starts_at',
        'expires_at',
        'is_active',
    ];

    public function advertable(): MorphTo
    {
        return $this->morphTo();
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where('starts_at', '<=', now())
            ->where('expires_at', '>', now());
    }

    public function scopeForPlatform($query, string $platform)
    {
        return $query->where('platform', $platform);
    }

    public function scopeForPlacement($query, string $placement)
    {
        return $query->where('placement', $placement);
    }

    public function scopeForRegion($query, string $regionId)
    {
        return $query->whereJsonContains('regions', $regionId);
    }

    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<=', now());
    }

    public function incrementImpressions(): void
    {
        $this->increment('impressions_count');
    }

    public function incrementClicks(): void
    {
        $this->increment('clicks_count');
    }

    public function markAsInactive(): void
    {
        $this->update(['is_active' => false]);
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function getClickThroughRate(): float
    {
        if ($this->impressions_count === 0) {
            return 0.0;
        }

        return ($this->clicks_count / $this->impressions_count) * 100;
    }

    public function getCTR(): string
    {
        return number_format($this->getClickThroughRate(), 2);
    }

    protected function casts(): array
    {
        return [
            'regions' => 'array',
            'config' => 'array',
            'starts_at' => 'datetime',
            'expires_at' => 'datetime',
            'is_active' => 'boolean',
            'impressions_count' => 'integer',
            'clicks_count' => 'integer',
        ];
    }
}
