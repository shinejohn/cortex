<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Seeder;

final class NotificationSeeder extends Seeder
{
    /**
     * Seed notifications.
     */
    public function run(): void
    {
        $users = User::all();

        if ($users->isEmpty()) {
            $this->command->warn('⚠ No users found. Run UserSeeder first.');
            return;
        }

        // Create notifications using factory
        $targetCount = 500;
        $notifications = Notification::factory($targetCount)->create([
            'user_id' => fn() => $users->random()->id,
        ]);

        $this->command->info("✓ Created {$targetCount} notifications");
        $this->command->info("✓ Total notifications: " . Notification::count());
    }
}


