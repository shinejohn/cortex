<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\EmergencyAlert;
use App\Models\User;
use Illuminate\Database\Seeder;

final class EmergencyAlertSeeder extends Seeder
{
    /**
     * Seed emergency alerts.
     */
    public function run(): void
    {
        $users = User::all();
        $communities = \App\Models\Community::all();

        if ($users->isEmpty() || $communities->isEmpty()) {
            $this->command->warn('⚠ No users or communities found. Run UserSeeder and CommunitySeeder first.');

            return;
        }

        // Create emergency alerts using factory
        $targetCount = 20;
        $alerts = EmergencyAlert::factory($targetCount)->create([
            'created_by' => fn () => $users->random()->id,
            'community_id' => fn () => $communities->random()->id,
        ]);

        $this->command->info("✓ Created {$targetCount} emergency alerts");
        $this->command->info('✓ Total emergency alerts: '.EmergencyAlert::count());
    }
}
