<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class BusinessTemplate extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'industry_id',
        'layout_config',
        'available_tabs',
        'default_tabs',
        'ai_features',
        'theme_config',
        'component_overrides',
        'seo_template',
        'schema_template',
        'is_premium',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'layout_config' => 'array',
            'available_tabs' => 'array',
            'default_tabs' => 'array',
            'ai_features' => 'array',
            'theme_config' => 'array',
            'component_overrides' => 'array',
            'seo_template' => 'array',
            'schema_template' => 'array',
            'is_premium' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function industry(): BelongsTo
    {
        return $this->belongsTo(Industry::class);
    }

    public function businesses(): HasMany
    {
        return $this->hasMany(Business::class, 'template_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
