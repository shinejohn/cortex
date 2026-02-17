<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class UserBehavioralProfile extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'user_id',
        'category_affinities',
        'temporal_patterns',
        'spending_patterns',
        'geographic_preferences',
        'engagement_score',
        'auto_segments',
        'last_computed_at',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Determine if the profile needs to be recomputed based on staleness.
     */
    public function needsRecomputation(int $staleHours = 24): bool
    {
        if ($this->last_computed_at === null) {
            return true;
        }

        return $this->last_computed_at->diffInHours(now()) >= $staleHours;
    }

    protected function casts(): array
    {
        return [
            'category_affinities' => 'array',
            'temporal_patterns' => 'array',
            'spending_patterns' => 'array',
            'geographic_preferences' => 'array',
            'auto_segments' => 'array',
            'last_computed_at' => 'datetime',
        ];
    }
}
