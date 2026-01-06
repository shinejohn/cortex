<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Hub;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\Seeder;

final class HubSeeder extends Seeder
{
    /**
     * Seed hubs.
     */
    public function run(): void
    {
        $workspaces = Workspace::all();
        $users = User::all();

        if ($workspaces->isEmpty() || $users->isEmpty()) {
            $this->command->warn('⚠ No workspaces or users found. Run WorkspaceSeeder and UserSeeder first.');
            return;
        }

        // Create hubs using factory
        $targetCount = 15;
        $hubs = Hub::factory($targetCount)->create([
            'workspace_id' => fn() => $workspaces->random()->id,
            'created_by' => fn() => $users->random()->id,
        ]);

        $this->command->info("✓ Created {$targetCount} hubs");
        $this->command->info("✓ Total hubs: " . Hub::count());
    }
}


