<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

final class NotificationSubscription extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'user_id',
        'platform',
        'community_id',
        'business_id',
        'phone_number',
        'phone_verified',
        'phone_verified_at',
        'web_push_endpoint',
        'web_push_p256dh',
        'web_push_auth',
        'sns_sms_subscription_arn',
        'sns_endpoint_arn',
        'notification_types',
        'frequency',
        'quiet_hours_start',
        'quiet_hours_end',
        'status',
        'last_notification_at',
    ];

    protected $casts = [
        'phone_verified' => 'boolean',
        'phone_verified_at' => 'datetime',
        'notification_types' => 'array',
        'quiet_hours_start' => 'datetime:H:i',
        'quiet_hours_end' => 'datetime:H:i',
        'last_notification_at' => 'datetime',
    ];

    /**
     * Get the user that owns the subscription
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the business (for AlphaSite)
     */
    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    /**
     * Scope: Active subscriptions
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope: For specific platform
     */
    public function scopeForPlatform($query, string $platform)
    {
        return $query->where('platform', $platform);
    }

    /**
     * Scope: For specific community
     */
    public function scopeForCommunity($query, string $communityId)
    {
        return $query->where('community_id', $communityId);
    }

    /**
     * Scope: Has SMS subscription
     */
    public function scopeHasSms($query)
    {
        return $query->whereNotNull('phone_number')
            ->where('phone_verified', true)
            ->whereNotNull('sns_sms_subscription_arn');
    }

    /**
     * Scope: Has web push subscription
     */
    public function scopeHasWebPush($query)
    {
        return $query->whereNotNull('web_push_endpoint');
    }

    /**
     * Check if currently in quiet hours
     */
    public function isQuietHours(): bool
    {
        $now = Carbon::now()->format('H:i');
        $start = Carbon::parse($this->quiet_hours_start)->format('H:i');
        $end = Carbon::parse($this->quiet_hours_end)->format('H:i');

        if ($start <= $end) {
            // Normal case: 22:00 to 08:00
            return $now >= $start || $now <= $end;
        } else {
            // Wraps midnight: 22:00 to 08:00
            return $now >= $start || $now <= $end;
        }
    }

    /**
     * Check if user wants this notification type
     */
    public function wantsNotificationType(string $type): bool
    {
        return in_array($type, $this->notification_types ?? []);
    }

    /**
     * Check if subscription is active and ready
     */
    public function isActive(): bool
    {
        return $this->status === 'active' && !$this->isQuietHours();
    }
}
