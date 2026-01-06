<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\SearchSuggestion;
use Illuminate\Database\Seeder;

final class SearchSuggestionSeeder extends Seeder
{
    /**
     * Seed search suggestions.
     */
    public function run(): void
    {
        // Create search suggestions using factory
        $targetCount = 100;
        $suggestions = SearchSuggestion::factory($targetCount)->create();

        $this->command->info("✓ Created {$targetCount} search suggestions");
        $this->command->info("✓ Total search suggestions: " . SearchSuggestion::count());
    }
}


