<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class HubAnalytics extends Model
{
    /** @use HasFactory<\Database\Factories\HubAnalyticsFactory> */
    use HasFactory, HasUuid;

    protected $fillable = [
        'hub_id',
        'date',
        'page_views',
        'unique_visitors',
        'events_created',
        'events_published',
        'articles_created',
        'articles_published',
        'members_joined',
        'followers_gained',
        'engagement_score',
        'revenue',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'page_views' => 'integer',
            'unique_visitors' => 'integer',
            'events_created' => 'integer',
            'events_published' => 'integer',
            'articles_created' => 'integer',
            'articles_published' => 'integer',
            'members_joined' => 'integer',
            'followers_gained' => 'integer',
            'engagement_score' => 'decimal:2',
            'revenue' => 'decimal:2',
            'metadata' => 'array',
        ];
    }

    public function hub(): BelongsTo
    {
        return $this->belongsTo(Hub::class);
    }

    public function scopeForDateRange($query, string $startDate, string $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('date', '>=', now()->subDays($days));
    }
}

