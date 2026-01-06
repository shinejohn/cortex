<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\PlannedEvent;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\Seeder;

final class PlannedEventSeeder extends Seeder
{
    /**
     * Seed planned events.
     */
    public function run(): void
    {
        $users = User::all();
        $workspaces = Workspace::all();

        if ($users->isEmpty() || $workspaces->isEmpty()) {
            $this->command->warn('⚠ No users or workspaces found. Run UserSeeder and WorkspaceSeeder first.');
            return;
        }

        // Create planned events using factory
        $targetCount = 50;
        $plannedEvents = PlannedEvent::factory($targetCount)->create([
            'user_id' => fn() => $users->random()->id,
            'workspace_id' => fn() => $workspaces->random()->id,
        ]);

        $this->command->info("✓ Created {$targetCount} planned events");
        $this->command->info("✓ Total planned events: " . PlannedEvent::count());
    }
}


