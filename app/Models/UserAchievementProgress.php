<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class UserAchievementProgress extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'user_achievement_progress';

    protected $fillable = [
        'user_id',
        'achievement_slug',
        'category',
        'current_progress',
        'target_value',
        'completed_at',
        'points_awarded',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Increment the progress towards this achievement.
     */
    public function incrementProgress(int $amount = 1): void
    {
        $this->current_progress = min(
            $this->current_progress + $amount,
            $this->target_value
        );
        $this->save();
    }

    /**
     * Check if this achievement has been completed.
     */
    public function isCompleted(): bool
    {
        return $this->completed_at !== null;
    }

    /**
     * @param  Builder<UserAchievementProgress>  $query
     */
    public function scopeCompleted(Builder $query): Builder
    {
        return $query->whereNotNull('completed_at');
    }

    /**
     * @param  Builder<UserAchievementProgress>  $query
     */
    public function scopeInCategory(Builder $query, string $category): Builder
    {
        return $query->where('category', $category);
    }

    protected function casts(): array
    {
        return [
            'completed_at' => 'datetime',
        ];
    }
}
