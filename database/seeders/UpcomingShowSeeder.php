<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Performer;
use App\Models\UpcomingShow;
use App\Models\Venue;
use Illuminate\Database\Seeder;

final class UpcomingShowSeeder extends Seeder
{
    /**
     * Seed upcoming shows.
     */
    public function run(): void
    {
        $performers = Performer::all();
        $venues = Venue::all();

        if ($performers->isEmpty()) {
            $this->command->warn('⚠ No performers found. Run PerformerSeeder first.');
            return;
        }

        foreach ($performers->take(30) as $performer) {
            // Create 1-4 upcoming shows per performer
            $showCount = rand(1, 4);
            UpcomingShow::factory($showCount)->create([
                'performer_id' => $performer->id,
                'venue_id' => fn() => $venues->isNotEmpty() && rand(0, 1) ? $venues->random()->id : null,
            ]);
        }

        $totalShows = UpcomingShow::count();
        $this->command->info("✓ Total upcoming shows: {$totalShows}");
    }
}


