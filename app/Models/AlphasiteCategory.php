<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class AlphasiteCategory extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'alphasite_categories';

    protected $fillable = [
        'name',
        'singular_name',
        'slug',
        'parent_id',
        'icon',
        'sort_order',
        'is_active',
        'seo_description_template',
        'ai_industry_overview',
        'ai_faq_templates',
        'related_category_ids',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    public function businesses(): HasMany
    {
        return $this->hasMany(Business::class, 'category_id');
    }

    public function cityContent(): HasMany
    {
        return $this->hasMany(CityCategoryContent::class, 'category_id');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Related categories for cross-linking.
     */
    public function relatedCategories(): Builder
    {
        if (empty($this->related_category_ids)) {
            return self::where('is_active', true)->where('id', '!=', $this->id)->limit(5);
        }

        return self::whereIn('id', $this->related_category_ids)->where('is_active', true);
    }

    /**
     * Get business count for a specific city.
     */
    public function businessCountInCity(string $cityId): int
    {
        return Business::where('city_id', $cityId)
            ->where('category_id', $this->id)
            ->count();
    }

    protected function casts(): array
    {
        return [
            'ai_faq_templates' => 'array',
            'related_category_ids' => 'array',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }
}
