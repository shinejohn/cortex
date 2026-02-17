<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class LocationShare extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'user_id',
        'event_id',
        'group_id',
        'latitude',
        'longitude',
        'accuracy_meters',
        'expires_at',
        'stopped_at',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(SocialGroup::class, 'group_id');
    }

    /**
     * Stop sharing location.
     */
    public function stop(): void
    {
        $this->update(['stopped_at' => now()]);
    }

    /**
     * Check if this share is currently active.
     */
    public function isActive(): bool
    {
        return $this->stopped_at === null && $this->expires_at->isFuture();
    }

    /**
     * @param  Builder<LocationShare>  $query
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->whereNull('stopped_at')
            ->where('expires_at', '>=', now());
    }

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'accuracy_meters' => 'decimal:2',
            'expires_at' => 'datetime',
            'stopped_at' => 'datetime',
        ];
    }
}
