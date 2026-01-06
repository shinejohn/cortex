<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Hub;
use App\Models\HubSection;
use Illuminate\Database\Seeder;

final class HubSectionSeeder extends Seeder
{
    /**
     * Seed hub sections.
     */
    public function run(): void
    {
        $hubs = Hub::all();

        if ($hubs->isEmpty()) {
            $this->command->warn('⚠ No hubs found. Run HubSeeder first.');
            return;
        }

        foreach ($hubs as $hub) {
            // Create 3-6 sections per hub
            $sectionCount = rand(3, 6);
            HubSection::factory($sectionCount)->create([
                'hub_id' => $hub->id,
            ]);
        }

        $totalSections = HubSection::count();
        $this->command->info("✓ Total hub sections: {$totalSections}");
    }
}


