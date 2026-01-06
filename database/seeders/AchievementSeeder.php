<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Achievement;
use App\Models\Business;
use Illuminate\Database\Seeder;

final class AchievementSeeder extends Seeder
{
    /**
     * Seed business achievements.
     */
    public function run(): void
    {
        $businesses = Business::all();

        if ($businesses->isEmpty()) {
            $this->command->warn('⚠ No businesses found. Run BusinessSeeder first.');
            return;
        }

        foreach ($businesses->take(40) as $business) {
            // Create 1-5 achievements per business
            $achievementCount = rand(1, 5);
            Achievement::factory($achievementCount)->create([
                'business_id' => $business->id,
            ]);
        }

        $totalAchievements = Achievement::count();
        $this->command->info("✓ Total achievements: {$totalAchievements}");
    }
}


