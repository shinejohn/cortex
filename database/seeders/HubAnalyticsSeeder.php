<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Hub;
use App\Models\HubAnalytics;
use Illuminate\Database\Seeder;

final class HubAnalyticsSeeder extends Seeder
{
    /**
     * Seed hub analytics.
     */
    public function run(): void
    {
        $hubs = Hub::all();

        if ($hubs->isEmpty()) {
            $this->command->warn('⚠ No hubs found. Run HubSeeder first.');
            return;
        }

        foreach ($hubs as $hub) {
            // Create analytics records for the past 30 days
            for ($i = 0; $i < 30; $i++) {
                HubAnalytics::factory()->create([
                    'hub_id' => $hub->id,
                    'date' => now()->subDays($i),
                ]);
            }
        }

        $totalAnalytics = HubAnalytics::count();
        $this->command->info("✓ Total hub analytics records: {$totalAnalytics}");
    }
}


