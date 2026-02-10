<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\CreatorProfile;
use App\Models\Podcast;
use App\Models\Region;
use App\Models\Workspace;
use Illuminate\Database\Seeder;

final class PodcastSeeder extends Seeder
{
    /**
     * Seed podcasts.
     */
    public function run(): void
    {
        $creatorProfiles = CreatorProfile::all();
        $workspaces = Workspace::all();
        $regions = Region::where('type', 'city')->get();

        if ($creatorProfiles->isEmpty() || $workspaces->isEmpty()) {
            $this->command->warn('⚠ No creator profiles or workspaces found. Run CreatorProfileSeeder and WorkspaceSeeder first.');

            return;
        }

        // Create podcasts using factory
        $targetCount = 30;
        $podcasts = Podcast::factory($targetCount)->create([
            'creator_profile_id' => fn () => $creatorProfiles->random()->id,
        ]);

        // Attach podcasts to regions
        if ($regions->isNotEmpty()) {
            foreach ($podcasts as $podcast) {
                $podcast->regions()->attach($regions->random(rand(1, 2))->pluck('id')->toArray());
            }
        }

        $this->command->info("✓ Created {$targetCount} podcasts");
        $this->command->info('✓ Total podcasts: '.Podcast::count());
    }
}
