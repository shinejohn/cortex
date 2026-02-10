<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\EmergencySubscription;
use Illuminate\Database\Seeder;

final class EmergencySubscriptionSeeder extends Seeder
{
    /**
     * Seed emergency subscriptions.
     */
    public function run(): void
    {
        $subscribers = \App\Models\EmailSubscriber::all();

        if ($subscribers->isEmpty()) {
            $this->command->warn('⚠ No subscribers found. Run EmailSubscriberSeeder first.');

            return;
        }

        // Create subscriptions for 40% of subscribers
        foreach ($subscribers->take((int) ceil($subscribers->count() * 0.4)) as $subscriber) {
            EmergencySubscription::firstOrCreate(
                [
                    'subscriber_id' => $subscriber->id,
                ],
                EmergencySubscription::factory()->make([
                    'subscriber_id' => $subscriber->id,
                ])->toArray()
            );
        }

        $totalSubscriptions = EmergencySubscription::count();
        $this->command->info("✓ Total emergency subscriptions: {$totalSubscriptions}");
    }
}
