<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Business;
use App\Models\Coupon;
use App\Models\Region;
use App\Models\User;
use Illuminate\Database\Seeder;

final class CouponSeeder extends Seeder
{
    /**
     * Seed coupons.
     */
    public function run(): void
    {
        $users = User::all();
        $businesses = Business::all();
        $regions = Region::where('type', 'city')->get();

        if ($users->isEmpty()) {
            $this->command->warn('⚠ No users found. Run UserSeeder first.');
            return;
        }

        // Create coupons using factory
        $targetCount = 100;
        $coupons = Coupon::factory($targetCount)->create([
            'user_id' => fn() => $users->random()->id,
            'business_id' => fn() => $businesses->isNotEmpty() && rand(0, 1) ? $businesses->random()->id : null,
        ]);

        // Attach coupons to regions
        if ($regions->isNotEmpty()) {
            foreach ($coupons as $coupon) {
                $coupon->regions()->attach($regions->random(rand(1, 2))->pluck('id')->toArray());
            }
        }

        $this->command->info("✓ Created {$targetCount} coupons");
        $this->command->info("✓ Total coupons: " . Coupon::count());
    }
}


