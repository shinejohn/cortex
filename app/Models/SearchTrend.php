<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class SearchTrend extends Model
{
    use HasUuids;

    protected $fillable = [
        'region_id',
        'query',
        'search_volume',
        'trend_direction',
        'last_checked_at',
    ];

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    protected function casts(): array
    {
        return [
            'last_checked_at' => 'datetime',
        ];
    }
}
