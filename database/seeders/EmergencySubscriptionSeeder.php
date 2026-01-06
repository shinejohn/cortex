<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\EmergencySubscription;
use App\Models\Region;
use App\Models\User;
use Illuminate\Database\Seeder;

final class EmergencySubscriptionSeeder extends Seeder
{
    /**
     * Seed emergency subscriptions.
     */
    public function run(): void
    {
        $users = User::all();
        $regions = Region::where('type', 'city')->get();

        if ($users->isEmpty()) {
            $this->command->warn('⚠ No users found. Run UserSeeder first.');
            return;
        }

        // Create subscriptions for 40% of users
        foreach ($users->take(ceil($users->count() * 0.4)) as $user) {
            EmergencySubscription::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'region_id' => fn() => $regions->isNotEmpty() ? $regions->random()->id : null,
                ],
                EmergencySubscription::factory()->make([
                    'user_id' => $user->id,
                    'region_id' => fn() => $regions->isNotEmpty() ? $regions->random()->id : null,
                ])->toArray()
            );
        }

        $totalSubscriptions = EmergencySubscription::count();
        $this->command->info("✓ Total emergency subscriptions: {$totalSubscriptions}");
    }
}


