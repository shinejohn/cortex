<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Classified;
use App\Models\Region;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\Seeder;

final class ClassifiedSeeder extends Seeder
{
    /**
     * Seed classifieds.
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

        // Create classifieds using factory
        $targetCount = 200;
        $classifieds = Classified::factory($targetCount)->create([
            'user_id' => fn() => $users->random()->id,
            'workspace_id' => fn() => $workspaces->random()->id,
        ]);

        // Attach classifieds to regions
        if ($regions->isNotEmpty()) {
            foreach ($classifieds as $classified) {
                $classified->regions()->attach($regions->random(rand(1, 2))->pluck('id')->toArray());
            }
        }

        $this->command->info("✓ Created {$targetCount} classifieds");
        $this->command->info("✓ Total classifieds: " . Classified::count());
    }
}


