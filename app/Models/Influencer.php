<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Influencer extends Model
{
    use HasUuids;

    protected $guarded = [];

    protected $casts = [
        'social_handles' => 'array',
        'topics_of_interest' => 'array',
        'last_interaction_at' => 'datetime',
    ];

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }
}
