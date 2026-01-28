<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class ReaderEngagement extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'session_id',
        'region_id',
        'content_type',
        'content_id',
        'engagement_type',
        'time_spent_seconds',
        'scroll_depth_percent',
        'metadata',
        'device_type',
        'referrer_source',
        'engaged_at',
    ];

    protected $casts = [
        'engaged_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
