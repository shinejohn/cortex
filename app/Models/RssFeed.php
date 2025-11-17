<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

final class RssFeed extends Model
{
    /** @use HasFactory<\Database\Factories\RssFeedFactory> */
    use HasFactory, HasUuid, SoftDeletes;

    protected $fillable = [
        'business_id',
        'url',
        'feed_type',
        'title',
        'description',
        'status',
        'health_status',
        'last_checked_at',
        'last_successful_fetch_at',
        'last_error',
        'fetch_frequency',
        'total_items_count',
        'metadata',
        'auto_approved',
    ];

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function feedItems(): HasMany
    {
        return $this->hasMany(RssFeedItem::class);
    }

    public function dayNewsPosts(): HasMany
    {
        return $this->hasMany(DayNewsPost::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeInactive($query)
    {
        return $query->where('status', 'inactive');
    }

    public function scopeBroken($query)
    {
        return $query->where('status', 'broken');
    }

    public function scopeHealthy($query)
    {
        return $query->where('health_status', 'healthy');
    }

    public function scopeDegraded($query)
    {
        return $query->where('health_status', 'degraded');
    }

    public function scopeUnhealthy($query)
    {
        return $query->where('health_status', 'unhealthy');
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('feed_type', $type);
    }

    public function scopeAutoApproved($query)
    {
        return $query->where('auto_approved', true);
    }

    public function scopeNeedingCheck($query)
    {
        return $query->where('status', 'active')
            ->where(function ($q) {
                $q->whereNull('last_checked_at')
                    ->orWhereRaw('last_checked_at < NOW() - INTERVAL \'1 minute\' * fetch_frequency');
            });
    }

    // Helper methods
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isHealthy(): bool
    {
        return $this->health_status === 'healthy';
    }

    public function isBroken(): bool
    {
        return $this->status === 'broken';
    }

    public function markAsHealthy(): void
    {
        $this->update([
            'health_status' => 'healthy',
            'last_successful_fetch_at' => now(),
            'last_error' => null,
        ]);
    }

    public function markAsDegraded(?string $error = null): void
    {
        $this->update([
            'health_status' => 'degraded',
            'last_error' => $error,
        ]);
    }

    public function markAsUnhealthy(?string $error = null): void
    {
        $this->update([
            'health_status' => 'unhealthy',
            'last_error' => $error,
        ]);
    }

    public function markAsBroken(?string $error = null): void
    {
        $this->update([
            'status' => 'broken',
            'health_status' => 'unhealthy',
            'last_error' => $error,
        ]);
    }

    public function updateLastChecked(): void
    {
        $this->update([
            'last_checked_at' => now(),
        ]);
    }

    public function incrementItemCount(): void
    {
        $this->increment('total_items_count');
    }

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'auto_approved' => 'boolean',
            'last_checked_at' => 'datetime',
            'last_successful_fetch_at' => 'datetime',
            'fetch_frequency' => 'integer',
            'total_items_count' => 'integer',
        ];
    }
}
