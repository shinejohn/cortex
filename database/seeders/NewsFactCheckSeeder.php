<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\NewsFactCheck;
use Illuminate\Database\Seeder;

final class NewsFactCheckSeeder extends Seeder
{
    /**
     * Seed news fact checks.
     */
    public function run(): void
    {
        $drafts = \App\Models\NewsArticleDraft::all();

        if ($drafts->isEmpty()) {
            $this->command->warn('⚠ No article drafts found. Run NewsArticleDraftSeeder first.');

            return;
        }

        // Create fact checks for 30% of drafts
        $draftsToCheck = $drafts->random((int) ceil($drafts->count() * 0.3));

        foreach ($draftsToCheck as $draft) {
            NewsFactCheck::factory()->create([
                'draft_id' => $draft->id,
            ]);
        }

        $totalChecks = NewsFactCheck::count();
        $this->command->info("✓ Total news fact checks: {$totalChecks}");
    }
}
