<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Workspace;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

final class CreateEventSystemWorkspaceCommand extends Command
{
    protected $signature = 'events:create-system-workspace';

    protected $description = 'Create the system workspace for AI-extracted events';

    public function handle(): int
    {
        $workspaceName = config('news-workflow.event_extraction.system_workspace_name', 'AI Event Extraction');
        $existingId = config('news-workflow.event_extraction.system_workspace_id');

        // Check if workspace ID is already configured
        if ($existingId) {
            $workspace = Workspace::find($existingId);
            if ($workspace) {
                $this->info("System workspace already configured: {$workspace->name} (ID: {$workspace->id})");

                return Command::SUCCESS;
            }
        }

        // Find or create workspace
        $workspace = Workspace::firstOrCreate(
            ['name' => $workspaceName],
            ['slug' => Str::slug($workspaceName)]
        );

        $this->info("System workspace ready: {$workspace->name}");
        $this->info("Workspace ID: {$workspace->id}");
        $this->newLine();
        $this->line('Add this to your .env file:');
        $this->line("NEWS_WORKFLOW_SYSTEM_WORKSPACE_ID={$workspace->id}");

        return Command::SUCCESS;
    }
}
