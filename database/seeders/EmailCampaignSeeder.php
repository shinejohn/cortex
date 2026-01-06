<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\EmailCampaign;
use App\Models\Workspace;
use Illuminate\Database\Seeder;

final class EmailCampaignSeeder extends Seeder
{
    /**
     * Seed email campaigns.
     */
    public function run(): void
    {
        $workspaces = Workspace::all();

        if ($workspaces->isEmpty()) {
            $this->command->warn('⚠ No workspaces found. Run WorkspaceSeeder first.');
            return;
        }

        // Create email campaigns using factory
        $targetCount = 20;
        $campaigns = EmailCampaign::factory($targetCount)->create([
            'workspace_id' => fn() => $workspaces->random()->id,
        ]);

        $this->command->info("✓ Created {$targetCount} email campaigns");
        $this->command->info("✓ Total email campaigns: " . EmailCampaign::count());
    }
}


