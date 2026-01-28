<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Civic Collection Run Model
 * 
 * Tracks individual collection runs for civic sources
 */
class CivicCollectionRun extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'civic_source_id',
        'region_id',
        'started_at',
        'completed_at',
        'status',
        'items_found',
        'items_new',
        'items_updated',
        'items_skipped',
        'error_message',
        'metadata',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'items_found' => 'integer',
        'items_new' => 'integer',
        'items_updated' => 'integer',
        'items_skipped' => 'integer',
        'metadata' => 'array',
    ];

    /**
     * Status constants
     */
    public const STATUS_RUNNING = 'running';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_FAILED = 'failed';

    /**
     * Get the civic source
     */
    public function civicSource(): BelongsTo
    {
        return $this->belongsTo(CivicSource::class);
    }

    /**
     * Get the region
     */
    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    /**
     * Scope to running runs
     */
    public function scopeRunning($query)
    {
        return $query->where('status', self::STATUS_RUNNING);
    }

    /**
     * Scope to completed runs
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    /**
     * Scope to failed runs
     */
    public function scopeFailed($query)
    {
        return $query->where('status', self::STATUS_FAILED);
    }

    /**
     * Scope to recent runs
     */
    public function scopeRecent($query, int $hours = 24)
    {
        return $query->where('started_at', '>=', now()->subHours($hours));
    }

    /**
     * Mark as completed
     */
    public function markCompleted(int $itemsFound, int $itemsNew = 0, int $itemsSkipped = 0): void
    {
        $this->update([
            'status' => self::STATUS_COMPLETED,
            'completed_at' => now(),
            'items_found' => $itemsFound,
            'items_new' => $itemsNew,
            'items_skipped' => $itemsSkipped,
        ]);
    }

    /**
     * Mark as failed
     */
    public function markFailed(string $errorMessage): void
    {
        $this->update([
            'status' => self::STATUS_FAILED,
            'completed_at' => now(),
            'error_message' => $errorMessage,
        ]);
    }

    /**
     * Get duration in seconds
     */
    public function getDurationAttribute(): ?int
    {
        if (!$this->completed_at) {
            return null;
        }

        return $this->completed_at->diffInSeconds($this->started_at);
    }
}
