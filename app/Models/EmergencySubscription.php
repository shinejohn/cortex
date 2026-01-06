<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class EmergencySubscription extends Model
{
    use HasFactory;
    protected $fillable = [
        'subscriber_id',
        'email_enabled',
        'sms_enabled',
        'phone_number',
        'phone_verified',
        'phone_verification_code',
        'phone_verified_at',
        'priority_levels',
        'categories',
        'stripe_subscription_id',
        'sms_tier',
    ];

    protected $casts = [
        'email_enabled' => 'boolean',
        'sms_enabled' => 'boolean',
        'phone_verified' => 'boolean',
        'phone_verified_at' => 'datetime',
        'priority_levels' => 'array',
        'categories' => 'array',
    ];

    public function subscriber(): BelongsTo
    {
        return $this->belongsTo(EmailSubscriber::class, 'subscriber_id');
    }

    public function deliveries(): HasMany
    {
        return $this->hasMany(EmergencyDelivery::class, 'subscription_id');
    }

    public function shouldReceiveAlert(EmergencyAlert $alert): bool
    {
        // Check priority level
        $priorities = $this->priority_levels ?? ['critical', 'urgent', 'advisory', 'info'];
        if (!in_array($alert->priority, $priorities)) {
            return false;
        }

        // Check category
        $categories = $this->categories ?? [];
        if (!empty($categories) && !in_array($alert->category, $categories)) {
            return false;
        }

        return true;
    }

    public function canReceiveSms(): bool
    {
        return $this->sms_enabled
            && $this->phone_verified
            && $this->sms_tier !== 'none';
    }
}
