<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\NotificationSubscription;
use App\Models\User;
use Illuminate\Database\Seeder;

final class NotificationSubscriptionSeeder extends Seeder
{
    /**
     * Seed notification subscriptions.
     */
    public function run(): void
    {
        $users = User::all();

        if ($users->isEmpty()) {
            $this->command->warn('⚠ No users found. Run UserSeeder first.');

            return;
        }

        $platforms = ['daynews', 'goeventcity', 'downtownguide', 'alphasite'];

        foreach ($users as $user) {
            // Subscribe user to 1-3 platforms
            $userPlatforms = \Illuminate\Support\Arr::random($platforms, rand(1, 3));

            foreach ($userPlatforms as $platform) {
                // Check uniqueness
                if (NotificationSubscription::where('user_id', $user->id)->where('platform', $platform)->exists()) {
                    continue;
                }

                NotificationSubscription::factory()->create([
                    'user_id' => $user->id,
                    'platform' => $platform,
                    'phone_number' => rand(0, 1) ? fake()->phoneNumber() : null,
                    'web_push_endpoint' => rand(0, 1) ? fake()->url() : null,
                    'community_id' => null, // Simplify for now
                ]);
            }
        }

        $totalSubscriptions = NotificationSubscription::count();
        $this->command->info("✓ Total notification subscriptions: {$totalSubscriptions}");
    }
}
