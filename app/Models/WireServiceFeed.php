<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

final class WireServiceFeed extends Model
{
    use HasUuids;

    protected $fillable = [
        'name', 'service_provider', 'feed_url', 'feed_format',
        'geographic_filters', 'industry_filters', 'keyword_filters',
        'poll_interval_minutes', 'is_enabled', 'last_polled_at', 'last_successful_at',
        'consecutive_failures', 'last_error', 'health_score', 'api_key_encrypted',
    ];

    protected $casts = [
        'geographic_filters' => 'array',
        'industry_filters' => 'array',
        'keyword_filters' => 'array',
        'is_enabled' => 'boolean',
        'last_polled_at' => 'datetime',
        'last_successful_at' => 'datetime',
    ];

    protected $hidden = ['api_key_encrypted'];

    public function runs()
    {
        return $this->hasMany(WireServiceRun::class, 'feed_id');
    }

    public function scopeEnabled($query)
    {
        return $query->where('is_enabled', true);
    }

    /**
     * Feeds due for polling: enabled, and last_polled_at is null or older than poll_interval_minutes.
     */
    public function scopeDueForPolling($query)
    {
        return $query->enabled()
            ->where(function ($q) {
                $q->whereNull('last_polled_at')
                    ->orWhereRaw(
                        DB::getDriverName() === 'sqlite'
                            ? 'last_polled_at < datetime("now", "-" || poll_interval_minutes || " minutes")'
                            : "last_polled_at < NOW() - (poll_interval_minutes * INTERVAL '1 minute')"
                    );
            });
    }

    public function recordSuccess(): void
    {
        $this->update([
            'last_polled_at' => now(),
            'last_successful_at' => now(),
            'consecutive_failures' => 0,
            'health_score' => min(100, $this->health_score + 5),
            'last_error' => null,
        ]);
    }

    public function recordFailure(string $error): void
    {
        $this->increment('consecutive_failures');
        $this->update([
            'last_polled_at' => now(),
            'last_error' => $error,
            'health_score' => max(0, $this->health_score - 10),
        ]);
        if ($this->consecutive_failures >= 10) {
            $this->update(['is_enabled' => false]);
        }
    }
}
