<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Coupon;
use App\Models\User;

final class CouponPolicy
{
    /**
     * Determine if the user can update the coupon.
     */
    public function update(User $user, Coupon $coupon): bool
    {
        return $user->id === $coupon->user_id;
    }

    /**
     * Determine if the user can delete the coupon.
     */
    public function delete(User $user, Coupon $coupon): bool
    {
        return $user->id === $coupon->user_id || $user->can('moderate', Coupon::class);
    }
}

