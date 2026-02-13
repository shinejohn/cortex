<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class BusinessServiceArea extends Model
{
    use HasFactory, HasUuid;

    public const AREA_TYPE_CITY = 'city';

    public const AREA_TYPE_COUNTY = 'county';

    /**
     * Pricing per community by plan tier.
     * No volume discounts — each community is the same price.
     */
    public const PRICING = [
        'influencer' => ['monthly' => 300, 'annual' => 3000],
        'expert' => ['monthly' => 400, 'annual' => 4000],
        'enterprise' => ['monthly' => 999, 'annual' => 9990],
    ];

    protected $fillable = [
        'business_id',
        'area_type',
        'city_id',
        'county_id',
        'status',
        'plan_tier',
        'monthly_price',
        'billing_cycle',
        'stripe_subscription_item_id',
        'show_in_listings',
        'show_in_search',
        'ad_slots_included',
        'started_at',
        'canceled_at',
        'expires_at',
    ];

    public static function getPriceFor(string $planTier, string $billingCycle = 'monthly'): float
    {
        return (float) (self::PRICING[$planTier][$billingCycle] ?? 0);
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function county(): BelongsTo
    {
        return $this->belongsTo(County::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    public function scopeForCity(Builder $query, string $cityId): Builder
    {
        return $query->where(function ($q) use ($cityId) {
            $q->where(function ($inner) use ($cityId) {
                $inner->where('area_type', self::AREA_TYPE_CITY)
                    ->where('city_id', $cityId);
            });
            $q->orWhere(function ($inner) use ($cityId) {
                $city = City::find($cityId);
                if ($city && $city->county_id) {
                    $inner->where('area_type', self::AREA_TYPE_COUNTY)
                        ->where('county_id', $city->county_id);
                }
            });
        });
    }

    public function isActive(): bool
    {
        return $this->status === 'active'
            && (! $this->expires_at || $this->expires_at->isFuture());
    }

    public function getDisplayNameAttribute(): string
    {
        if ($this->area_type === self::AREA_TYPE_CITY && $this->city) {
            return $this->city->display_name;
        }
        if ($this->area_type === self::AREA_TYPE_COUNTY && $this->county) {
            return $this->county->display_name;
        }

        return 'Unknown Area';
    }

    protected function casts(): array
    {
        return [
            'monthly_price' => 'decimal:2',
            'show_in_listings' => 'boolean',
            'show_in_search' => 'boolean',
            'ad_slots_included' => 'integer',
            'started_at' => 'datetime',
            'canceled_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }
}
