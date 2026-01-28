<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommunityLog extends Model
{
    use HasUuids;

    protected $guarded = [];

    protected $casts = [
        'occurred_at' => 'date',
        'key_figures' => 'array',
        'impact_metrics' => 'array',
    ];

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }
}
