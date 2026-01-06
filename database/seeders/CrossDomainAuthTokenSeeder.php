<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\CrossDomainAuthToken;
use App\Models\User;
use Illuminate\Database\Seeder;

final class CrossDomainAuthTokenSeeder extends Seeder
{
    /**
     * Seed cross-domain auth tokens.
     */
    public function run(): void
    {
        $users = User::all();

        if ($users->isEmpty()) {
            $this->command->warn('⚠ No users found. Run UserSeeder first.');
            return;
        }

        // Create tokens using factory
        $targetCount = 50;
        $tokens = CrossDomainAuthToken::factory($targetCount)->create([
            'user_id' => fn() => $users->random()->id,
        ]);

        $this->command->info("✓ Created {$targetCount} cross-domain auth tokens");
        $this->command->info("✓ Total tokens: " . CrossDomainAuthToken::count());
    }
}


