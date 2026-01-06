<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

final class UserSeeder extends Seeder
{
    /**
     * Seed users.
     */
    public function run(): void
    {
        // Create admin user
        User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // Create test user
        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // Create additional users using factory
        $existingCount = User::count();
        $targetCount = 20;

        if ($existingCount < $targetCount) {
            $users = User::factory($targetCount - $existingCount)->create([
                'email_verified_at' => now(),
            ]);

            $this->command->info('✓ Created ' . $users->count() . ' additional users');
        }

        $totalUsers = User::count();
        $this->command->info("✓ Total users: {$totalUsers}");
    }
}


