<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class Industry extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
        'parent_id',
        'default_template_id',
        'available_features',
        'required_fields',
        'seo_title',
        'seo_description',
        'schema_type',
        'display_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'available_features' => 'array',
            'required_fields' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Industry::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Industry::class, 'parent_id');
    }

    public function defaultTemplate(): BelongsTo
    {
        return $this->belongsTo(BusinessTemplate::class, 'default_template_id');
    }

    public function businesses(): HasMany
    {
        return $this->hasMany(Business::class, 'industry_id');
    }

    public function templates(): HasMany
    {
        return $this->hasMany(BusinessTemplate::class, 'industry_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
