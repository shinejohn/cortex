<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class TopListTopic extends Model
{
    use HasUuids;

    protected $fillable = [
        'region_id',
        'category',
        'places_type',
        'topic_slug',
        'display_name',
        'last_published_at',
        'next_scheduled_at',
        'search_volume',
        'seasonality_peak_months',
    ];

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    public function articles(): HasMany
    {
        return $this->hasMany(TopListArticle::class, 'topic_id');
    }

    public function scopeDueForPublishing($query)
    {
        return $query->whereNotNull('next_scheduled_at')
            ->where('next_scheduled_at', '<=', now());
    }

    protected function casts(): array
    {
        return [
            'last_published_at' => 'datetime',
            'next_scheduled_at' => 'datetime',
            'seasonality_peak_months' => 'array',
        ];
    }
}
