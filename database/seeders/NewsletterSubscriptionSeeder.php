<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\NewsletterSubscription;
use App\Models\User;
use Illuminate\Database\Seeder;

final class NewsletterSubscriptionSeeder extends Seeder
{
    /**
     * Seed newsletter subscriptions.
     */
    public function run(): void
    {
        $users = User::all();

        // Create newsletter subscriptions using factory
        $targetCount = 300;
        $subscriptions = NewsletterSubscription::factory($targetCount)->create([
            'user_id' => fn() => $users->isNotEmpty() && rand(0, 1) ? $users->random()->id : null,
        ]);

        $this->command->info("✓ Created {$targetCount} newsletter subscriptions");
        $this->command->info("✓ Total newsletter subscriptions: " . NewsletterSubscription::count());
    }
}


