<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class Region extends Model
{
    /** @use HasFactory<\Database\Factories\RegionFactory> */
    use HasFactory, HasUuid;

    protected $fillable = [
        'name',
        'slug',
        'type',
        'parent_id',
        'description',
        'is_active',
        'display_order',
        'metadata',
        'latitude',
        'longitude',
        'timezone',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    public function zipcodes(): HasMany
    {
        return $this->hasMany(RegionZipcode::class);
    }

    public function newsArticles(): HasMany
    {
        return $this->hasMany(NewsArticle::class);
    }

    public function businesses(): BelongsToMany
    {
        return $this->belongsToMany(Business::class, 'business_region')
            ->withTimestamps();
    }

    public function events(): BelongsToMany
    {
        return $this->belongsToMany(Event::class, 'event_region')
            ->withTimestamps();
    }

    /**
     * Get civic sources for this region
     */
    public function civicSources(): HasMany
    {
        return $this->hasMany(CivicSource::class);
    }

    /**
     * Get all ancestor regions (parents up the hierarchy)
     */
    public function ancestors(): array
    {
        $ancestors = [];
        $current = $this->parent;

        while ($current !== null) {
            $ancestors[] = $current;
            $current = $current->parent;
        }

        return $ancestors;
    }

    /**
     * Get all descendant regions (children down the hierarchy)
     */
    public function descendants(): array
    {
        $descendants = [];

        foreach ($this->children as $child) {
            $descendants[] = $child;
            $descendants = array_merge($descendants, $child->descendants());
        }

        return $descendants;
    }

    /**
     * Check if this region has a specific zipcode
     */
    public function hasZipcode(string $zipcode): bool
    {
        return $this->zipcodes()->where('zipcode', $zipcode)->exists();
    }

    /**
     * Get full hierarchical name
     */
    public function getFullNameAttribute(): string
    {
        $names = [$this->name];

        foreach ($this->ancestors() as $ancestor) {
            $names[] = $ancestor->name;
        }

        return implode(', ', $names);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeForZipcode($query, string $zipcode)
    {
        return $query->whereHas('zipcodes', function ($q) use ($zipcode) {
            $q->where('zipcode', $zipcode);
        });
    }

    public function scopeTopLevel($query)
    {
        return $query->whereNull('parent_id');
    }

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'metadata' => 'array',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
        ];
    }
}
