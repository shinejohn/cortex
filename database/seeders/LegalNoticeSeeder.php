<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\LegalNotice;
use App\Models\Region;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\Seeder;

final class LegalNoticeSeeder extends Seeder
{
    /**
     * Seed legal notices.
     */
    public function run(): void
    {
        $users = User::all();
        $workspaces = Workspace::all();
        $regions = Region::where('type', 'city')->get();

        if ($users->isEmpty() || $workspaces->isEmpty()) {
            $this->command->warn('⚠ No users or workspaces found. Run UserSeeder and WorkspaceSeeder first.');
            return;
        }

        // Create legal notices using factory
        $targetCount = 50;
        $notices = LegalNotice::factory($targetCount)->create([
            'user_id' => fn() => $users->random()->id,
            'workspace_id' => fn() => $workspaces->random()->id,
        ]);

        // Attach notices to regions
        if ($regions->isNotEmpty()) {
            foreach ($notices as $notice) {
                $notice->regions()->attach($regions->random(rand(1, 2))->pluck('id')->toArray());
            }
        }

        $this->command->info("✓ Created {$targetCount} legal notices");
        $this->command->info("✓ Total legal notices: " . LegalNotice::count());
    }
}


