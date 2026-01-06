<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\SearchHistory;
use App\Models\User;
use Illuminate\Database\Seeder;

final class SearchHistorySeeder extends Seeder
{
    /**
     * Seed search history.
     */
    public function run(): void
    {
        $users = User::all();

        if ($users->isEmpty()) {
            $this->command->warn('⚠ No users found. Run UserSeeder first.');
            return;
        }

        // Create search history using factory
        $targetCount = 500;
        $searchHistory = SearchHistory::factory($targetCount)->create([
            'user_id' => fn() => $users->random()->id,
        ]);

        $this->command->info("✓ Created {$targetCount} search history records");
        $this->command->info("✓ Total search history: " . SearchHistory::count());
    }
}


