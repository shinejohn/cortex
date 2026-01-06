<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\EmailTemplate;
use App\Models\Workspace;
use Illuminate\Database\Seeder;

final class EmailTemplateSeeder extends Seeder
{
    /**
     * Seed email templates.
     */
    public function run(): void
    {
        $workspaces = Workspace::all();

        if ($workspaces->isEmpty()) {
            $this->command->warn('⚠ No workspaces found. Run WorkspaceSeeder first.');
            return;
        }

        // Create email templates using factory
        $targetCount = 20;
        $templates = EmailTemplate::factory($targetCount)->create([
            'workspace_id' => fn() => $workspaces->random()->id,
        ]);

        $this->command->info("✓ Created {$targetCount} email templates");
        $this->command->info("✓ Total email templates: " . EmailTemplate::count());
    }
}


