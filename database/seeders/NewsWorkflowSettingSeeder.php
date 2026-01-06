<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\NewsWorkflowSetting;
use App\Models\Region;
use Illuminate\Database\Seeder;

final class NewsWorkflowSettingSeeder extends Seeder
{
    /**
     * Seed news workflow settings.
     */
    public function run(): void
    {
        $regions = Region::where('type', 'city')->get();

        if ($regions->isEmpty()) {
            $this->command->warn('⚠ No regions found. Run RegionSeeder first.');
            return;
        }

        foreach ($regions as $region) {
            NewsWorkflowSetting::firstOrCreate(
                ['region_id' => $region->id],
                NewsWorkflowSetting::factory()->make([
                    'region_id' => $region->id,
                ])->toArray()
            );
        }

        $totalSettings = NewsWorkflowSetting::count();
        $this->command->info("✓ Total workflow settings: {$totalSettings}");
    }
}


