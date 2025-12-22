<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class PlannedEvent extends Model
{
    /** @use HasFactory<\Database\Factories\PlannedEventFactory> */
    use HasFactory, HasUuid;

    protected $fillable = [
        'event_id',
        'user_id',
        'planned_at',
        'reminder_sent',
        'reminder_sent_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'planned_at' => 'datetime',
            'reminder_sent' => 'boolean',
            'reminder_sent_at' => 'datetime',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeForUser($query, string $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeUpcoming($query)
    {
        return $query->whereHas('event', function ($q) {
            $q->where('event_date', '>=', now());
        });
    }

    public function scopeNeedsReminder($query, int $hoursBefore = 24)
    {
        return $query->where('reminder_sent', false)
            ->whereHas('event', function ($q) use ($hoursBefore) {
                $q->whereBetween('event_date', [
                    now(),
                    now()->addHours($hoursBefore),
                ]);
            });
    }
}

