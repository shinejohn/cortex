<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class AlphaSiteCommunity extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'alphasite_communities';

    protected $fillable = [
        'city',
        'state',
        'country',
        'slug',
        'name',
        'description',
        'hero_image_url',
        'logo_url',
        'total_businesses',
        'premium_businesses',
        'total_categories',
        'seo_title',
        'seo_description',
        'featured_categories',
        'is_active',
        'launched_at',
    ];

    protected function casts(): array
    {
        return [
            'featured_categories' => 'array',
            'is_active' => 'boolean',
            'launched_at' => 'datetime',
        ];
    }

    public function businesses(): HasMany
    {
        return $this->hasMany(Business::class, 'city', 'city')
            ->where('state', $this->state)
            ->where('status', 'active');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
