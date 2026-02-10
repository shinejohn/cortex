<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\PlannedEvent;
use App\Models\User;
use Illuminate\Database\Seeder;

final class PlannedEventSeeder extends Seeder
{
    /**
     * Seed planned events.
     */
    public function run(): void
    {
        $users = User::all();
        $events = \App\Models\Event::all();

        if ($users->isEmpty() || $events->isEmpty()) {
            $this->command->warn('⚠ No users or events found. Run UserSeeder and EventSeeder first.');

            return;
        }

        // Create planned events using factory
        $targetCount = 50;
        $plannedEvents = PlannedEvent::factory($targetCount)->create([
            'user_id' => fn () => $users->random()->id,
            'event_id' => fn () => $events->random()->id,
        ]);

        $this->command->info("✓ Created {$targetCount} planned events");
        $this->command->info('✓ Total planned events: '.PlannedEvent::count());
    }
}
