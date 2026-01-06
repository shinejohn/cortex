<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\NewsWorkflowRun;
use App\Models\Region;
use App\Models\WriterAgent;
use Illuminate\Database\Seeder;

final class NewsWorkflowRunSeeder extends Seeder
{
    /**
     * Seed news workflow runs.
     */
    public function run(): void
    {
        $regions = Region::where('type', 'city')->get();
        $writerAgents = WriterAgent::all();

        if ($regions->isEmpty()) {
            $this->command->warn('⚠ No regions found. Run RegionSeeder first.');
            return;
        }

        // Create workflow runs using factory
        $targetCount = 100;
        $runs = NewsWorkflowRun::factory($targetCount)->create([
            'region_id' => fn() => $regions->random()->id,
            'writer_agent_id' => fn() => $writerAgents->isNotEmpty() && rand(0, 1) ? $writerAgents->random()->id : null,
        ]);

        $this->command->info("✓ Created {$targetCount} workflow runs");
        $this->command->info("✓ Total workflow runs: " . NewsWorkflowRun::count());
    }
}


