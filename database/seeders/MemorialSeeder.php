<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Memorial;
use App\Models\Region;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\Seeder;

final class MemorialSeeder extends Seeder
{
    /**
     * Seed memorials.
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

        // Create memorials using factory
        $targetCount = 30;
        $memorials = Memorial::factory($targetCount)->create([
            'user_id' => fn() => $users->random()->id,
            'workspace_id' => fn() => $workspaces->random()->id,
        ]);

        // Attach memorials to regions
        if ($regions->isNotEmpty()) {
            foreach ($memorials as $memorial) {
                $memorial->regions()->attach($regions->random(rand(1, 2))->pluck('id')->toArray());
            }
        }

        $this->command->info("✓ Created {$targetCount} memorials");
        $this->command->info("✓ Total memorials: " . Memorial::count());
    }
}


