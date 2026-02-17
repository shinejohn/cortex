<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class BookingAgent extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'user_id',
        'agency_name',
        'slug',
        'bio',
        'specialties',
        'subscription_tier',
        'stripe_customer_id',
        'stripe_subscription_id',
        'subscription_status',
        'max_clients',
        'is_marketplace_visible',
        'service_areas',
        'average_rating',
        'total_bookings',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function clients(): HasMany
    {
        return $this->hasMany(AgentClient::class);
    }

    public function activeClients(): HasMany
    {
        return $this->clients()->where('status', 'active');
    }

    public function commissions(): HasMany
    {
        return $this->hasMany(AgentCommission::class);
    }

    public function canAddClient(): bool
    {
        return $this->activeClients()->count() < $this->max_clients;
    }

    public function hasReachedClientLimit(): bool
    {
        return ! $this->canAddClient();
    }

    public function isSubscribed(): bool
    {
        return in_array($this->subscription_status, ['active', 'trialing']);
    }

    public function scopeMarketplaceVisible($query)
    {
        return $query->where('is_marketplace_visible', true);
    }

    protected function casts(): array
    {
        return [
            'specialties' => 'array',
            'service_areas' => 'array',
            'is_marketplace_visible' => 'boolean',
            'average_rating' => 'decimal:2',
        ];
    }
}
