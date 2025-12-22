<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

final class Achievement extends Model
{
    use HasFactory, HasUuid, SoftDeletes;

    protected $fillable = [
        'business_id',
        'title',
        'description',
        'source_name',
        'source_url',
        'achievement_type',
        'achievement_date',
        'expiration_date',
        'icon',
        'badge_image_url',
        'is_verified',
        'display_order',
        'is_featured',
    ];

    protected function casts(): array
    {
        return [
            'achievement_date' => 'date',
            'expiration_date' => 'date',
            'is_verified' => 'boolean',
            'is_featured' => 'boolean',
        ];
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    public function scopeActive($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('expiration_date')
              ->orWhere('expiration_date', '>=', now());
        });
    }
}
