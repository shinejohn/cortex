<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\AdPlacement;
use Illuminate\Database\Seeder;

final class AdPlacementSeeder extends Seeder
{
    /**
     * Seed ad placements.
     */
    public function run(): void
    {
        $platforms = ['day_news', 'event_city', 'downtown_guide', 'alphasite_community'];
        $slots = [
            ['slot' => 'header_leaderboard', 'name' => 'Header Leaderboard', 'format' => 'leaderboard', 'width' => 728, 'height' => 90],
            ['slot' => 'sidebar_top', 'name' => 'Sidebar Top', 'format' => 'medium_rectangle', 'width' => 300, 'height' => 250],
            ['slot' => 'in_article', 'name' => 'In-Article', 'format' => 'billboard', 'width' => 970, 'height' => 250],
            ['slot' => 'footer', 'name' => 'Footer', 'format' => 'leaderboard', 'width' => 728, 'height' => 90],
        ];

        foreach ($platforms as $platform) {
            foreach ($slots as $slotData) {
                AdPlacement::firstOrCreate(
                    [
                        'platform' => $platform,
                        'slot' => $slotData['slot'],
                    ],
                    array_merge($slotData, [
                        'base_cpm' => rand(5, 20) + (rand(0, 99) / 100),
                        'base_cpc' => rand(1, 5) + (rand(0, 99) / 100),
                    ])
                );
            }
        }

        $totalPlacements = AdPlacement::count();
        $this->command->info("✓ Total ad placements: {$totalPlacements}");
    }
}
