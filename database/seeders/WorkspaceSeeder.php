<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\Seeder;

final class WorkspaceSeeder extends Seeder
{
    /**
     * Seed workspaces.
     */
    public function run(): void
    {
        $users = User::all();

        if ($users->isEmpty()) {
            $this->command->warn('⚠ No users found. Run UserSeeder first.');

            return;
        }

        // Create demo workspace
        $demoWorkspace = Workspace::firstOrCreate(
            ['slug' => 'demo-workspace'],
            [
                'name' => 'Demo Workspace',
                'owner_id' => $users->first()->id,
            ]
        );

        // Assign to Admin User
        $adminUser = $users->first();
        if ($adminUser) {
            $adminUser->current_workspace_id = $demoWorkspace->id;
            $adminUser->save();
        }

        // Create additional workspaces using factory
        $existingCount = Workspace::count();
        $targetCount = 10;

        if ($existingCount < $targetCount) {
            $workspaces = Workspace::factory($targetCount - $existingCount)->create([
                'owner_id' => fn () => $users->random()->id,
            ]);

            $this->command->info('✓ Created '.$workspaces->count().' additional workspaces');
        }

        $totalWorkspaces = Workspace::count();
        $this->command->info("✓ Total workspaces: {$totalWorkspaces}");
    }
}
