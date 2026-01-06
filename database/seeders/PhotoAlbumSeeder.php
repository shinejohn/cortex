<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\PhotoAlbum;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\Seeder;

final class PhotoAlbumSeeder extends Seeder
{
    /**
     * Seed photo albums.
     */
    public function run(): void
    {
        $users = User::all();
        $workspaces = Workspace::all();

        if ($users->isEmpty() || $workspaces->isEmpty()) {
            $this->command->warn('⚠ No users or workspaces found. Run UserSeeder and WorkspaceSeeder first.');
            return;
        }

        // Create photo albums using factory
        $targetCount = 100;
        $albums = PhotoAlbum::factory($targetCount)->create([
            'user_id' => fn() => $users->random()->id,
            'workspace_id' => fn() => $workspaces->random()->id,
        ]);

        $this->command->info("✓ Created {$targetCount} photo albums");
        $this->command->info("✓ Total photo albums: " . PhotoAlbum::count());
    }
}


