<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Photo;
use App\Models\PhotoAlbum;
use App\Models\Region;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\Seeder;

final class PhotoSeeder extends Seeder
{
    /**
     * Seed photos.
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

        // Create photo albums first
        $albums = PhotoAlbum::factory(50)->create([
            'user_id' => fn() => $users->random()->id,
            'workspace_id' => fn() => $workspaces->random()->id,
        ]);

        // Create photos
        $targetCount = 500;
        $photos = Photo::factory($targetCount)->create([
            'user_id' => fn() => $users->random()->id,
            'workspace_id' => fn() => $workspaces->random()->id,
            'photo_album_id' => fn() => $albums->random()->id,
        ]);

        // Attach photos to regions
        if ($regions->isNotEmpty()) {
            foreach ($photos as $photo) {
                $photo->regions()->attach($regions->random(rand(1, 2))->pluck('id')->toArray());
            }
        }

        $this->command->info("✓ Created {$targetCount} photos");
        $this->command->info("✓ Total photos: " . Photo::count());
    }
}


