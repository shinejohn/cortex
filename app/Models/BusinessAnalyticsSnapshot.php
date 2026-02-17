<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class BusinessAnalyticsSnapshot extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'business_analytics_snapshots';

    protected $fillable = [
        'business_id',
        'date',
        'metrics',
        'financials',
        'interactions',
    ];

    protected $casts = [
        'date' => 'date',
        'metrics' => 'array',
        'financials' => 'array',
        'interactions' => 'array',
    ];

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }
}
