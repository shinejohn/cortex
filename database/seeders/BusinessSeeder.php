<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Business;
use App\Models\Region;
use App\Models\Workspace;
use Illuminate\Database\Seeder;

final class BusinessSeeder extends Seeder
{
    /**
     * Seed businesses.
     */
    public function run(): void
    {
        $workspaces = Workspace::all();
        $regions = Region::where('type', 'city')->get();

        if ($workspaces->isEmpty()) {
            $this->command->warn('⚠ No workspaces found. Run WorkspaceSeeder first.');
            return;
        }

        // Create businesses using factory
        $targetCount = 100;
        $businesses = Business::factory($targetCount)->create([
            'workspace_id' => fn() => $workspaces->random()->id,
        ]);

        // Attach businesses to regions
        if ($regions->isNotEmpty()) {
            foreach ($businesses as $business) {
                $business->regions()->attach($regions->random(rand(1, 3))->pluck('id')->toArray());
            }
        }

        $this->command->info("✓ Created {$targetCount} businesses");
        $this->command->info("✓ Total businesses: " . Business::count());
    }
}


