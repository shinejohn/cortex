<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class CollectionMethod extends Model
{
    use HasUuids;

    protected $fillable = [
        'source_id', 'method_type', 'name', 'endpoint_url', 'poll_interval_minutes',
        'feed_format', 'feed_last_modified', 'feed_etag', 'intake_email', 'signup_url',
        'subscription_status', 'confirmed_at', 'last_email_received_at', 'emails_received_count',
        'scrape_config', 'requires_javascript', 'platform_config', 'is_enabled', 'is_primary',
        'last_collected_at', 'last_successful_at', 'last_items_found', 'total_items_collected',
        'consecutive_failures', 'last_error',
    ];

    protected $casts = [
        'scrape_config' => 'array', 'platform_config' => 'array',
        'is_enabled' => 'boolean', 'is_primary' => 'boolean', 'requires_javascript' => 'boolean',
        'confirmed_at' => 'datetime', 'last_email_received_at' => 'datetime', 'last_collected_at' => 'datetime',
    ];

    public const TYPE_RSS = 'rss';
    public const TYPE_EMAIL = 'email';
    public const TYPE_SCRAPE = 'scrape';
    public const TYPE_CIVICPLUS = 'civicplus';
    public const TYPE_NIXLE = 'nixle';
    public const TYPE_POLICE = 'police';
    public const TYPE_SCHOOL = 'school';
    public const TYPE_EVENT_CALENDAR = 'event_calendar';

    public const SUB_PENDING = 'pending';
    public const SUB_AWAITING_CONFIRMATION = 'awaiting_confirmation';
    public const SUB_CONFIRMED = 'confirmed';
    public const SUB_ACTIVE = 'active';

    public function source() { return $this->belongsTo(NewsSource::class, 'source_id'); }
    public function rawContent() { return $this->hasMany(RawContent::class, 'collection_method_id'); }

    public function scopeEnabled($q) { return $q->where('is_enabled', true); }
    public function scopeByType($q, $t) { return $q->where('method_type', $t); }
    
    public function scopeDueForCollection($q) {
        return $q->where('is_enabled', true)
            ->whereHas('source', fn($sq) => $sq->where('is_active', true))
            ->where(fn($sq) => $sq->whereNull('last_collected_at')
                ->orWhereRaw('last_collected_at < NOW() - (poll_interval_minutes * INTERVAL \'1 minute\')'));
    }

    public function recordCollection(int $items, int $duplicates = 0): void {
        $this->update([
            'last_collected_at' => now(), 'last_successful_at' => now(),
            'last_items_found' => $items, 'total_items_collected' => $this->total_items_collected + $items,
            'consecutive_failures' => 0, 'last_error' => null,
        ]);
        $this->source->recordSuccess();
    }

    public function recordFailure(string $error): void {
        $this->update([
            'last_collected_at' => now(), 'consecutive_failures' => $this->consecutive_failures + 1,
            'last_error' => $error,
        ]);
        if ($this->consecutive_failures >= 5) $this->update(['is_enabled' => false]);
        $this->source->recordFailure($error);
    }

    public function recordEmailReceived(): void {
        $this->update([
            'last_email_received_at' => now(),
            'emails_received_count' => $this->emails_received_count + 1,
            'subscription_status' => self::SUB_ACTIVE,
        ]);
    }

    public function markConfirmed(): void {
        $this->update(['subscription_status' => self::SUB_CONFIRMED, 'confirmed_at' => now()]);
    }
}
