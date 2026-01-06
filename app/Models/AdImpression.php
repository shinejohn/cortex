<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

final class AdImpression extends Model
{
    use HasFactory;
    // Timestamps are enabled in migration

    protected $fillable = [
        'creative_id',
        'placement_id',
        'community_id',
        'session_id',
        'ip_hash',
        'user_agent',
        'referrer',
        'cost',
        'impressed_at',
    ];

    protected $casts = [
        'cost' => 'decimal:4',
        'impressed_at' => 'datetime',
    ];

    public function creative(): BelongsTo
    {
        return $this->belongsTo(AdCreative::class, 'creative_id');
    }

    public function placement(): BelongsTo
    {
        return $this->belongsTo(AdPlacement::class, 'placement_id');
    }

    public function community(): BelongsTo
    {
        return $this->belongsTo(Community::class, 'community_id');
    }

    public function click(): HasOne
    {
        return $this->hasOne(AdClick::class, 'impression_id');
    }
}
