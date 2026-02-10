<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\CheckIn;
use App\Models\User;
use Illuminate\Database\Seeder;

final class CheckInSeeder extends Seeder
{
    /**
     * Seed check-ins.
     */
    public function run(): void
    {
        $events = \App\Models\Event::all();
        $users = User::all();

        if ($events->isEmpty() || $users->isEmpty()) {
            $this->command->warn('⚠ No events or users found. Run EventSeeder and UserSeeder first.');

            return;
        }

        // Create check-ins manually to avoid unique constraint violations
        $createdCount = 0;
        foreach ($events as $event) {
            // Check in 0-5 users per event
            $checkInCount = rand(0, 5);
            $eventUsers = $users->random(min($checkInCount, $users->count()));

            foreach ($eventUsers as $user) {
                // Check if already exists (safe guard)
                if (CheckIn::where('event_id', $event->id)->where('user_id', $user->id)->exists()) {
                    continue;
                }

                CheckIn::factory()->create([
                    'event_id' => $event->id,
                    'user_id' => $user->id,
                ]);
                $createdCount++;
            }
        }

        $this->command->info("✓ Created {$createdCount} check-ins");
        $this->command->info('✓ Total check-ins: '.CheckIn::count());
    }
}
