<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

final class Coupon extends Model
{
    use HasFactory, HasUuid, \App\Traits\RelatableToOrganizations;

    protected $fillable = [
        'user_id',
        'business_id',
        'title',
        'description',
        'discount_type',
        'discount_value',
        'terms',
        'code',
        'image',
        'business_name',
        'business_location',
        'start_date',
        'end_date',
        'usage_limit',
        'used_count',
        'status',
        'views_count',
        'clicks_count',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function regions(): BelongsToMany
    {
        return $this->belongsToMany(Region::class, 'coupon_region')
            ->withTimestamps();
    }

    public function usages(): HasMany
    {
        return $this->hasMany(CouponUsage::class, 'coupon_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active')
            ->where('start_date', '<=', now()->toDateString())
            ->where('end_date', '>=', now()->toDateString());
    }

    public function scopeExpired($query)
    {
        return $query->where('end_date', '<', now()->toDateString())
            ->orWhere('status', 'expired');
    }

    public function scopeForRegion($query, int $regionId)
    {
        return $query->whereHas('regions', function ($q) use ($regionId) {
            $q->where('region_id', $regionId);
        });
    }

    public function scopeByBusiness($query, int $businessId)
    {
        return $query->where('business_id', $businessId);
    }

    public function isActive(): bool
    {
        return $this->status === 'active'
            && $this->start_date <= now()->toDateString()
            && $this->end_date >= now()->toDateString()
            && ($this->usage_limit === null || $this->used_count < $this->usage_limit);
    }

    public function isExpired(): bool
    {
        return $this->end_date < now()->toDateString() || $this->status === 'expired';
    }

    public function canBeUsed(): bool
    {
        return $this->isActive() && ($this->usage_limit === null || $this->used_count < $this->usage_limit);
    }

    public function incrementViewsCount(): void
    {
        $this->increment('views_count');
    }

    public function incrementClicksCount(): void
    {
        $this->increment('clicks_count');
    }

    public function recordUsage(?int $userId = null, ?string $ipAddress = null): void
    {
        $this->usages()->create([
            'user_id' => $userId,
            'ip_address' => $ipAddress ?? request()->ip(),
        ]);

        $this->increment('used_count');
    }

    protected static function booted(): void
    {
        self::creating(function (Coupon $coupon): void {
            if (empty($coupon->code)) {
                $coupon->code = static::generateUniqueCode();
            }
        });
    }

    protected static function generateUniqueCode(): string
    {
        do {
            $code = strtoupper(Str::random(8));
        } while (self::where('code', $code)->exists());

        return $code;
    }

    protected function casts(): array
    {
        return [
            'discount_value' => 'decimal:2',
            'start_date' => 'date',
            'end_date' => 'date',
            'usage_limit' => 'integer',
            'used_count' => 'integer',
            'views_count' => 'integer',
            'clicks_count' => 'integer',
        ];
    }
}

