<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Region;
use App\Models\WriterAgent;
use Illuminate\Database\Seeder;

final class WriterAgentSeeder extends Seeder
{
    /**
     * Seed writer agents.
     */
    public function run(): void
    {
        $regions = Region::where('type', 'city')->get();

        if ($regions->isEmpty()) {
            $this->command->warn('⚠ No regions found. Run RegionSeeder first.');
            return;
        }

        // Create writer agents using factory
        $targetCount = 20;
        $agents = WriterAgent::factory($targetCount)->create([
            'region_id' => fn() => $regions->random()->id,
        ]);

        $this->command->info("✓ Created {$targetCount} writer agents");
        $this->command->info("✓ Total writer agents: " . WriterAgent::count());
    }
}


