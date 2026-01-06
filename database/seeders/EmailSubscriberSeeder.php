<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\EmailSubscriber;
use Illuminate\Database\Seeder;

final class EmailSubscriberSeeder extends Seeder
{
    /**
     * Seed email subscribers.
     */
    public function run(): void
    {
        // Create email subscribers using factory
        $targetCount = 500;
        $subscribers = EmailSubscriber::factory($targetCount)->create();

        $this->command->info("✓ Created {$targetCount} email subscribers");
        $this->command->info("✓ Total email subscribers: " . EmailSubscriber::count());
    }
}


