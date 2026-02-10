<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\SocialAccount;
use App\Models\User;
use Illuminate\Database\Seeder;

final class SocialAccountSeeder extends Seeder
{
    /**
     * Seed social accounts (OAuth).
     */
    public function run(): void
    {
        $users = User::all();

        if ($users->isEmpty()) {
            $this->command->warn('⚠ No users found. Run UserSeeder first.');

            return;
        }

        // Create social accounts for 50% of users
        foreach ($users->take((int) ceil($users->count() * 0.5)) as $user) {
            $provider = \Illuminate\Support\Arr::random(['google', 'facebook', 'twitter', 'github']);

            if (SocialAccount::where('user_id', $user->id)->where('provider', $provider)->exists()) {
                continue;
            }

            SocialAccount::factory()->create([
                'user_id' => $user->id,
                'provider' => $provider,
            ]);
        }

        $totalAccounts = SocialAccount::count();
        $this->command->info("✓ Total social accounts: {$totalAccounts}");
    }
}
