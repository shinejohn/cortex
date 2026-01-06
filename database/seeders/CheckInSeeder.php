<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\CheckIn;
use App\Models\Hub;
use App\Models\User;
use Illuminate\Database\Seeder;

final class CheckInSeeder extends Seeder
{
    /**
     * Seed check-ins.
     */
    public function run(): void
    {
        $hubs = Hub::all();
        $users = User::all();

        if ($hubs->isEmpty() || $users->isEmpty()) {
            $this->command->warn('⚠ No hubs or users found. Run HubSeeder and UserSeeder first.');
            return;
        }

        // Create check-ins using factory
        $targetCount = 200;
        $checkIns = CheckIn::factory($targetCount)->create([
            'hub_id' => fn() => $hubs->random()->id,
            'user_id' => fn() => $users->random()->id,
        ]);

        $this->command->info("✓ Created {$targetCount} check-ins");
        $this->command->info("✓ Total check-ins: " . CheckIn::count());
    }
}


