<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class BusinessSubscription extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'business_id',
        'tier',
        'status',
        'trial_started_at',
        'trial_expires_at',
        'trial_converted_at',
        'subscription_started_at',
        'subscription_expires_at',
        'auto_renew',
        'stripe_subscription_id',
        'stripe_customer_id',
        'monthly_amount',
        'billing_cycle',
        'ai_services_enabled',
        'claimed_by_id',
        'claimed_at',
        'downgraded_at',
    ];

    protected function casts(): array
    {
        return [
            'trial_started_at' => 'datetime',
            'trial_expires_at' => 'datetime',
            'trial_converted_at' => 'datetime',
            'subscription_started_at' => 'datetime',
            'subscription_expires_at' => 'datetime',
            'claimed_at' => 'datetime',
            'downgraded_at' => 'datetime',
            'auto_renew' => 'boolean',
            'monthly_amount' => 'decimal:2',
            'ai_services_enabled' => 'array',
        ];
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function claimedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'claimed_by_id');
    }

    public function isTrial(): bool
    {
        return $this->tier === 'trial' && 
               $this->status === 'active' && 
               $this->trial_expires_at > now();
    }

    public function isPremium(): bool
    {
        return in_array($this->tier, ['standard', 'premium', 'enterprise']) &&
               $this->status === 'active';
    }

    public function isExpired(): bool
    {
        if ($this->tier === 'trial') {
            return $this->trial_expires_at < now();
        }
        
        return $this->subscription_expires_at && $this->subscription_expires_at < now();
    }
}
