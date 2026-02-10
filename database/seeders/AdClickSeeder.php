<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\AdClick;
use Illuminate\Database\Seeder;

final class AdClickSeeder extends Seeder
{
    /**
     * Seed ad clicks.
     */
    public function run(): void
    {
        $impressions = \App\Models\AdImpression::with(['creative', 'placement'])->inRandomOrder()->take(100)->get();

        if ($impressions->isEmpty()) {
            $this->command->warn('⚠ No ad impressions found. Run AdImpressionSeeder first.');

            return;
        }

        $targetCount = $impressions->count();
        foreach ($impressions as $impression) {
            AdClick::factory()->create([
                'impression_id' => $impression->id,
                'creative_id' => $impression->creative_id,
            ]);
        }

        $this->command->info("✓ Created {$targetCount} ad clicks");
        $this->command->info('✓ Total ad clicks: '.AdClick::count());
    }
}
