<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\Region;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\Seeder;

final class AnnouncementSeeder extends Seeder
{
    /**
     * Seed announcements.
     */
    public function run(): void
    {
        $users = User::all();
        $workspaces = Workspace::all();
        $regions = Region::where('type', 'city')->get();

        if ($users->isEmpty() || $workspaces->isEmpty()) {
            $this->command->warn('⚠ No users or workspaces found. Run UserSeeder and WorkspaceSeeder first.');
            return;
        }

        // Create announcements using factory
        $targetCount = 100;
        $announcements = Announcement::factory($targetCount)->create([
            'user_id' => fn() => $users->random()->id,
            'workspace_id' => fn() => $workspaces->random()->id,
        ]);

        // Attach announcements to regions
        if ($regions->isNotEmpty()) {
            foreach ($announcements as $announcement) {
                $announcement->regions()->attach($regions->random(rand(1, 3))->pluck('id')->toArray());
            }
        }

        $this->command->info("✓ Created {$targetCount} announcements");
        $this->command->info("✓ Total announcements: " . Announcement::count());
    }
}


