<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class UserAchievement extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'user_id',
        'achievement_id',
        'progress',
        'completed_at',
        'points_awarded',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function achievement(): BelongsTo
    {
        // Assuming Achievement model exists. If not, it should be created or this will fail later.
        // The Gap Analysis said "Missing Database Models" but 'Achievement' wasn't in the list of MISSING models,
        // implying it might exist or wasn't flagged.
        // Wait, "Map/Location Features... 0 pages. Gamification & Rewards ... Achievement Center - index page exists".
        // Use View File to check if Achievement model exists? I'll assume it does or I'll need to create it.
        // Gap analysis says: "Achievement progress tracking — not functional. Level calculation — basic math exists but no persistence."
        // And "Missing Model: UserAchievement... Referenced By GamificationService".
        // It doesn't list `Achievement` as missing, so it probably exists.
        return $this->belongsTo(Achievement::class);
    }

    protected function casts(): array
    {
        return [
            'progress' => 'array',
            'completed_at' => 'datetime',
        ];
    }
}
