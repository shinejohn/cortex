<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class SequenceEnrollment extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'user_id',
        'event_id',
        'trigger_type',
        'current_step',
        'status',
        'next_step_at',
        'completed_at',
        'step_history',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * Advance to the next step in the sequence.
     */
    public function advance(): void
    {
        $history = $this->step_history ?? [];
        $history[] = [
            'step' => $this->current_step,
            'completed_at' => now()->toISOString(),
        ];

        $this->update([
            'current_step' => $this->current_step + 1,
            'step_history' => $history,
            'next_step_at' => now()->addHours(24),
        ]);
    }

    /**
     * Mark the enrollment as completed.
     */
    public function complete(): void
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
            'next_step_at' => null,
        ]);
    }

    /**
     * Pause the enrollment.
     */
    public function pause(): void
    {
        $this->update([
            'status' => 'paused',
            'next_step_at' => null,
        ]);
    }

    /**
     * @param  Builder<SequenceEnrollment>  $query
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    /**
     * @param  Builder<SequenceEnrollment>  $query
     */
    public function scopeByTrigger(Builder $query, string $type): Builder
    {
        return $query->where('trigger_type', $type);
    }

    protected function casts(): array
    {
        return [
            'step_history' => 'array',
            'next_step_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }
}
