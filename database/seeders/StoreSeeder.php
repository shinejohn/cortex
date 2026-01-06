<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Store;
use App\Models\Workspace;
use Illuminate\Database\Seeder;

final class StoreSeeder extends Seeder
{
    /**
     * Seed stores.
     */
    public function run(): void
    {
        $workspaces = Workspace::all();

        if ($workspaces->isEmpty()) {
            $this->command->warn('⚠ No workspaces found. Run WorkspaceSeeder first.');
            return;
        }

        // Create stores using factory
        $targetCount = 30;
        $stores = Store::factory($targetCount)->create([
            'workspace_id' => fn() => $workspaces->random()->id,
        ]);

        $this->command->info("✓ Created {$targetCount} stores");
        $this->command->info("✓ Total stores: " . Store::count());
    }
}


