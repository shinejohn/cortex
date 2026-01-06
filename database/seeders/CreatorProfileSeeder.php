<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\CreatorProfile;
use App\Models\User;
use Illuminate\Database\Seeder;

final class CreatorProfileSeeder extends Seeder
{
    /**
     * Seed creator profiles.
     */
    public function run(): void
    {
        $users = User::all();

        if ($users->isEmpty()) {
            $this->command->warn('⚠ No users found. Run UserSeeder first.');
            return;
        }

        // Create creator profiles using factory
        $targetCount = 20;
        $creators = CreatorProfile::factory($targetCount)->create([
            'user_id' => fn() => $users->random()->id,
        ]);

        $this->command->info("✓ Created {$targetCount} creator profiles");
        $this->command->info("✓ Total creator profiles: " . CreatorProfile::count());
    }
}


