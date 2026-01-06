<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\EmergencyAlert;
use App\Models\Region;
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
        $regions = Region::where('type', 'city')->get();

        if ($users->isEmpty()) {
            $this->command->warn('⚠ No users found. Run UserSeeder first.');
            return;
        }

        // Create emergency alerts using factory
        $targetCount = 20;
        $alerts = EmergencyAlert::factory($targetCount)->create([
            'created_by' => fn() => $users->random()->id,
            'region_id' => fn() => $regions->isNotEmpty() && rand(0, 1) ? $regions->random()->id : null,
        ]);

        $this->command->info("✓ Created {$targetCount} emergency alerts");
        $this->command->info("✓ Total emergency alerts: " . EmergencyAlert::count());
    }
}


