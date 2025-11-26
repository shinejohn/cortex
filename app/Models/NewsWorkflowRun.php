<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class NewsWorkflowRun extends Model
{
    use HasUuids;

    protected $fillable = [
        'region_id',
        'phase',
        'status',
        'started_at',
        'completed_at',
        'items_processed',
        'summary',
        'error_message',
        'error_trace',
    ];

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    public function scopeForRegion($query, string $regionId)
    {
        return $query->where('region_id', $regionId);
    }

    public function scopeByPhase($query, string $phase)
    {
        return $query->where('phase', $phase);
    }

    public function scopeRunning($query)
    {
        return $query->where('status', 'running');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function scopeRecent($query, int $days = 7)
    {
        return $query->where('started_at', '>=', now()->subDays($days));
    }

    public function isRunning(): bool
    {
        return $this->status === 'running';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    public function getDuration(): ?int
    {
        if (! $this->completed_at) {
            return null;
        }

        return $this->started_at->diffInSeconds($this->completed_at);
    }

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'summary' => 'array',
        ];
    }
}
