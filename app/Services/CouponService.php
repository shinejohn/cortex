<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Business;
use App\Models\Coupon;
use App\Models\CouponUsage;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

final class CouponService
{
    public function __construct(
        private readonly CacheService $cacheService
    ) {}

    /**
     * Create a new coupon
     */
    public function create(array $data, int $userId): Coupon
    {
        $coupon = Coupon::create([
            'user_id' => $userId,
            'business_id' => $data['business_id'] ?? null,
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'discount_type' => $data['discount_type'],
            'discount_value' => $data['discount_value'],
            'terms' => $data['terms'] ?? null,
            'code' => $data['code'] ?? $this->generateUniqueCode(),
            'image' => $data['image'] ?? null,
            'business_name' => $data['business_name'] ?? null,
            'business_location' => $data['business_location'] ?? null,
            'valid_from' => $data['start_date'] ?? now(),
            'valid_until' => $data['end_date'] ?? null,
            'usage_limit' => $data['usage_limit'] ?? null,
            'used_count' => 0,
            'status' => $data['status'] ?? 'active',
        ]);

        // Attach regions if provided
        if (isset($data['regions']) && is_array($data['regions'])) {
            $coupon->regions()->sync($data['regions']);
        }

        // Clear cache
        $this->clearCouponCache($coupon);

        return $coupon->fresh(['regions', 'business']);
    }

    /**
     * Update an existing coupon
     */
    public function update(Coupon $coupon, array $data): Coupon
    {
        $coupon->update($data);

        // Update regions if provided
        if (isset($data['regions']) && is_array($data['regions'])) {
            $coupon->regions()->sync($data['regions']);
        }

        // Clear cache
        $this->clearCouponCache($coupon);

        return $coupon->fresh(['regions', 'business']);
    }

    /**
     * Validate a coupon code
     */
    public function validate(string $code, ?int $userId = null): array
    {
        $coupon = Coupon::where('code', $code)->first();

        if (! $coupon) {
            return [
                'valid' => false,
                'error' => 'Coupon code not found',
            ];
        }

        // Check status
        if ($coupon->status !== 'active') {
            return [
                'valid' => false,
                'error' => 'Coupon is not active',
            ];
        }

        // Check dates
        if ($coupon->valid_from && $coupon->valid_from->isFuture()) {
            return [
                'valid' => false,
                'error' => 'Coupon has not started yet',
            ];
        }

        if ($coupon->valid_until && $coupon->valid_until->isPast()) {
            return [
                'valid' => false,
                'error' => 'Coupon has expired',
            ];
        }

        // Check usage limit
        if ($coupon->usage_limit && $coupon->used_count >= $coupon->usage_limit) {
            return [
                'valid' => false,
                'error' => 'Coupon usage limit reached',
            ];
        }

        // Check if user already used this coupon (if userId provided)
        if ($userId && $this->hasUserUsedCoupon($coupon, $userId)) {
            return [
                'valid' => false,
                'error' => 'You have already used this coupon',
            ];
        }

        return [
            'valid' => true,
            'coupon' => $coupon,
            'discount_type' => $coupon->discount_type,
            'discount_value' => $coupon->discount_value,
        ];
    }

    /**
     * Apply a coupon (record usage)
     */
    public function apply(Coupon $coupon, int $userId, ?float $orderAmount = null): CouponUsage
    {
        DB::beginTransaction();

        try {
            // Validate before applying
            $validation = $this->validate($coupon->code, $userId);

            if (! $validation['valid']) {
                throw new Exception($validation['error']);
            }

            // Create usage record
            $usage = CouponUsage::create([
                'coupon_id' => $coupon->id,
                'user_id' => $userId,
                'order_amount' => $orderAmount,
                'discount_amount' => $this->calculateDiscount($coupon, $orderAmount),
                'used_at' => now(),
            ]);

            // Update coupon usage count
            $coupon->increment('used_count');

            // Increment clicks count
            $coupon->increment('clicks_count');

            DB::commit();

            // Clear cache
            $this->clearCouponCache($coupon);

            return $usage;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Track coupon view (for analytics)
     */
    public function trackView(Coupon $coupon): void
    {
        $coupon->increment('view_count');
        $this->clearCouponCache($coupon);
    }

    /**
     * Track coupon click (for analytics)
     */
    public function trackClick(Coupon $coupon): void
    {
        $coupon->increment('clicks_count');
        $this->clearCouponCache($coupon);
    }

    /**
     * Get active coupons
     */
    public function getActiveCoupons(array $filters = [], int $limit = 50): Collection
    {
        $cacheKey = 'coupons:active:'.md5(serialize([$filters, $limit]));

        return $this->cacheService->remember($cacheKey, 600, function () use ($filters, $limit) {
            $query = Coupon::where('status', 'active')
                ->where(function ($q) {
                    $q->whereNull('valid_from')
                        ->orWhere('valid_from', '<=', now());
                })
                ->where(function ($q) {
                    $q->whereNull('valid_until')
                        ->orWhere('valid_until', '>=', now());
                })
                ->where(function ($q) {
                    $q->whereNull('usage_limit')
                        ->orWhereColumn('used_count', '<', 'usage_limit');
                });

            // Filters
            if (isset($filters['business_id'])) {
                $query->where('business_id', $filters['business_id']);
            }

            if (isset($filters['region_id'])) {
                $query->whereHas('regions', function ($q) use ($filters) {
                    $q->where('regions.id', $filters['region_id']);
                });
            }

            if (isset($filters['category'])) {
                // Assuming coupons have categories or are linked via business
                // Adjust based on your schema
            }

            // Sorting
            $sortBy = $filters['sort_by'] ?? 'created_at';
            $sortOrder = $filters['sort_order'] ?? 'desc';
            $query->orderBy($sortBy, $sortOrder);

            return $query->with(['business', 'regions'])
                ->limit($limit)
                ->get();
        });
    }

    /**
     * Get coupons for a business
     */
    public function getCouponsForBusiness(Business|string $business, bool $activeOnly = true): Collection
    {
        $businessId = $business instanceof Business ? $business->id : $business;
        $cacheKey = "coupons:business:{$businessId}:".($activeOnly ? 'active' : 'all');

        return $this->cacheService->remember($cacheKey, 600, function () use ($businessId, $activeOnly) {
            $query = Coupon::where('business_id', $businessId);

            if ($activeOnly) {
                $query->where('status', 'active')
                    ->where(function ($q) {
                        $q->whereNull('valid_from')
                            ->orWhere('valid_from', '<=', now());
                    })
                    ->where(function ($q) {
                        $q->whereNull('valid_until')
                            ->orWhere('valid_until', '>=', now());
                    });
            }

            return $query->with(['regions'])
                ->orderBy('created_at', 'desc')
                ->get();
        });
    }

    /**
     * Check if user has used a coupon
     */
    public function hasUserUsedCoupon(Coupon $coupon, int $userId): bool
    {
        return CouponUsage::where('coupon_id', $coupon->id)
            ->where('user_id', $userId)
            ->exists();
    }

    /**
     * Calculate discount amount
     */
    public function calculateDiscount(Coupon $coupon, ?float $orderAmount = null): float
    {
        if ($coupon->discount_type === 'percentage') {
            if (! $orderAmount) {
                return 0.0;
            }

            return round($orderAmount * ($coupon->discount_value / 100), 2);
        }

        // Fixed amount
        return (float) $coupon->discount_value;
    }

    /**
     * Get featured coupons
     */
    public function getFeaturedCoupons(?string $regionId = null, int $limit = 6): Collection
    {
        $cacheKey = "coupons:featured:{$regionId}:{$limit}";

        return $this->cacheService->remember($cacheKey, 600, function () use ($regionId, $limit) {
            $query = Coupon::active()
                ->featured()
                ->latest();

            if ($regionId) {
                $query->whereHas('regions', function ($q) use ($regionId) {
                    $q->where('regions.id', $regionId);
                });
            }

            return $query->take($limit)->get();
        });
    }

    /**
     * Get coupons with pagination/filtering
     */
    public function getCoupons(
        ?string $regionId = null,
        ?string $categoryId = null,
        ?string $search = null,
        bool $showGlobal = false,
        int $perPage = 12
    ): \Illuminate\Contracts\Pagination\LengthAwarePaginator {
        $query = Coupon::active()->latest();

        if ($regionId) {
            $query->where(function ($q) use ($regionId, $showGlobal) {
                $q->whereHas('regions', function ($sq) use ($regionId) {
                    $sq->where('regions.id', $regionId);
                });

                if ($showGlobal) {
                    $q->orWhereDoesntHave('regions');
                }
            });
        }

        if ($categoryId) {
            $query->where('category', $categoryId);
        }

        if ($search) {
            $query->search($search);
        }

        return $query->paginate($perPage);
    }

    /**
     * Generate unique coupon code
     */
    private function generateUniqueCode(int $length = 8): string
    {
        do {
            $code = mb_strtoupper(mb_substr(md5(uniqid((string) mt_rand(), true)), 0, $length));
        } while (Coupon::where('code', $code)->exists());

        return $code;
    }

    /**
     * Clear coupon-related cache
     */
    private function clearCouponCache(Coupon $coupon): void
    {
        $this->cacheService->forget('coupons:active:*');

        if ($coupon->business_id) {
            $this->cacheService->forget("coupons:business:{$coupon->business_id}:*");
        }
    }
}
