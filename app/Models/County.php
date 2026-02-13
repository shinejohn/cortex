<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class County extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'name',
        'state',
        'state_full',
        'slug',
        'latitude',
        'longitude',
        'population',
        'seo_description',
        'ai_overview',
        'content_generated_at',
        'is_active',
    ];

    public function cities(): HasMany
    {
        return $this->hasMany(City::class);
    }

    public function serviceAreas(): HasMany
    {
        return $this->hasMany(BusinessServiceArea::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function getDisplayNameAttribute(): string
    {
        return "{$this->name} County, {$this->state}";
    }

    /**
     * Get all active businesses serving this county
     * (home city is in this county OR active county service area).
     */
    public function getActiveBusinesses(?string $categoryId = null): Builder
    {
        $cityIds = $this->cities()->pluck('id');

        $query = Business::where(function ($q) use ($cityIds) {
            $q->whereIn('city_id', $cityIds);
        })->orWhere(function ($q) {
            $q->whereIn('id',
                BusinessServiceArea::where('county_id', $this->id)
                    ->where('area_type', 'county')
                    ->where('status', 'active')
                    ->pluck('business_id')
            );
        });

        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }

        return $query;
    }

    protected function casts(): array
    {
        return [
            'population' => 'integer',
            'is_active' => 'boolean',
            'content_generated_at' => 'datetime',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
        ];
    }
}
