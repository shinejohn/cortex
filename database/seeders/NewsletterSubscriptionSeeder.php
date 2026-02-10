<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\NewsletterSubscription;
use Illuminate\Database\Seeder;

final class NewsletterSubscriptionSeeder extends Seeder
{
    /**
     * Seed newsletter subscriptions.
     */
    public function run(): void
    {
        $subscribers = \App\Models\EmailSubscriber::all();

        if ($subscribers->isEmpty()) {
            $this->command->warn('⚠ No subscribers found. Run EmailSubscriberSeeder first.');

            return;
        }

        // Create newsletter subscriptions using factory
        $targetCount = 300;
        $subscriptions = NewsletterSubscription::factory($targetCount)->create([
            'subscriber_id' => fn () => $subscribers->random()->id,
        ]);

        $this->command->info("✓ Created {$targetCount} newsletter subscriptions");
        $this->command->info('✓ Total newsletter subscriptions: '.NewsletterSubscription::count());
    }
}
