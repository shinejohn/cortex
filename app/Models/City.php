<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class City extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'name',
        'state',
        'state_full',
        'slug',
        'county',
        'county_id',
        'latitude',
        'longitude',
        'population',
        'timezone',
        'zip_code',
        'seo_description',
        'ai_overview',
        'ai_business_climate',
        'ai_community_highlights',
        'ai_faqs',
        'content_generated_at',
        'is_active',
    ];

    public function countyRecord(): BelongsTo
    {
        return $this->belongsTo(County::class, 'county_id');
    }

    public function businesses(): HasMany
    {
        return $this->hasMany(Business::class);
    }

    public function categoryContent(): HasMany
    {
        return $this->hasMany(CityCategoryContent::class);
    }

    public function neighbors(): BelongsToMany
    {
        return $this->belongsToMany(self::class, 'neighboring_cities', 'city_id', 'neighbor_id')
            ->withPivot('distance_miles');
    }

    public function serviceAreas(): HasMany
    {
        return $this->hasMany(BusinessServiceArea::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Find nearby cities within a radius (miles).
     */
    public function scopeNearby(Builder $query, float $lat, float $lng, int $radiusMiles = 30): Builder
    {
        return $query->selectRaw('*,
            (3959 * acos(
                cos(radians(?)) * cos(radians(latitude)) *
                cos(radians(longitude) - radians(?)) +
                sin(radians(?)) * sin(radians(latitude))
            )) AS distance_miles', [$lat, $lng, $lat])
            ->having('distance_miles', '<=', $radiusMiles)
            ->orderBy('distance_miles');
    }

    /**
     * Get categories that have at least one business in this city.
     */
    public function activeCategories(): Builder
    {
        return AlphasiteCategory::whereIn('id',
            Business::where('city_id', $this->id)->distinct()->pluck('category_id')
        )->where('is_active', true)->orderBy('name');
    }

    public function getDisplayNameAttribute(): string
    {
        return "{$this->name}, {$this->state}";
    }

    public function getFullDisplayNameAttribute(): string
    {
        return "{$this->name}, ".($this->state_full ?? $this->state);
    }

    public function hasContent(): bool
    {
        return $this->content_generated_at !== null;
    }

    protected function casts(): array
    {
        return [
            'ai_faqs' => 'array',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'population' => 'integer',
            'is_active' => 'boolean',
            'content_generated_at' => 'datetime',
        ];
    }
}
