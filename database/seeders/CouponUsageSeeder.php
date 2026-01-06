<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Coupon;
use App\Models\CouponUsage;
use App\Models\User;
use Illuminate\Database\Seeder;

final class CouponUsageSeeder extends Seeder
{
    /**
     * Seed coupon usage.
     */
    public function run(): void
    {
        $coupons = Coupon::all();
        $users = User::all();

        if ($coupons->isEmpty() || $users->isEmpty()) {
            $this->command->warn('⚠ No coupons or users found. Run CouponSeeder and UserSeeder first.');
            return;
        }

        // Create usage for 20% of coupons
        foreach ($coupons->take(ceil($coupons->count() * 0.2)) as $coupon) {
            $usageCount = rand(1, 10);
            $availableUsers = $users->random(min($usageCount, $users->count()));

            foreach ($availableUsers as $user) {
                CouponUsage::firstOrCreate(
                    [
                        'coupon_id' => $coupon->id,
                        'user_id' => $user->id,
                    ],
                    CouponUsage::factory()->make([
                        'coupon_id' => $coupon->id,
                        'user_id' => $user->id,
                    ])->toArray()
                );
            }
        }

        $totalUsage = CouponUsage::count();
        $this->command->info("✓ Total coupon usage: {$totalUsage}");
    }
}


