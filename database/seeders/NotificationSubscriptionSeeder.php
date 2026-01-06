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

        foreach ($users as $user) {
            // Create web push subscription for 70% of users
            if (rand(1, 100) <= 70) {
                NotificationSubscription::firstOrCreate(
                    [
                        'user_id' => $user->id,
                        'type' => 'web_push',
                    ],
                    NotificationSubscription::factory()->make([
                        'user_id' => $user->id,
                        'type' => 'web_push',
                    ])->toArray()
                );
            }

            // Create SMS subscription for 30% of users
            if (rand(1, 100) <= 30) {
                NotificationSubscription::firstOrCreate(
                    [
                        'user_id' => $user->id,
                        'type' => 'sms',
                    ],
                    NotificationSubscription::factory()->make([
                        'user_id' => $user->id,
                        'type' => 'sms',
                    ])->toArray()
                );
            }
        }

        $totalSubscriptions = NotificationSubscription::count();
        $this->command->info("✓ Total notification subscriptions: {$totalSubscriptions}");
    }
}


