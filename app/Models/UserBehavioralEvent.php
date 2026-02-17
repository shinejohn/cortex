<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class UserBehavioralEvent extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'user_id',
        'session_id',
        'event_type',
        'content_type',
        'content_id',
        'category',
        'context',
        'device_type',
        'latitude',
        'longitude',
        'occurred_at',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @param  Builder<UserBehavioralEvent>  $query
     */
    public function scopeForUser(Builder $query, int|string $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    /**
     * @param  Builder<UserBehavioralEvent>  $query
     */
    public function scopeOfType(Builder $query, string $type): Builder
    {
        return $query->where('event_type', $type);
    }

    /**
     * @param  Builder<UserBehavioralEvent>  $query
     */
    public function scopeInCategory(Builder $query, string $category): Builder
    {
        return $query->where('category', $category);
    }

    /**
     * @param  Builder<UserBehavioralEvent>  $query
     */
    public function scopeRecent(Builder $query, int $days = 30): Builder
    {
        return $query->where('occurred_at', '>=', now()->subDays($days));
    }

    protected function casts(): array
    {
        return [
            'context' => 'array',
            'occurred_at' => 'datetime',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
        ];
    }
}
