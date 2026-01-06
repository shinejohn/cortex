<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Classified;
use App\Models\ClassifiedImage;
use Illuminate\Database\Seeder;

final class ClassifiedImageSeeder extends Seeder
{
    /**
     * Seed classified images.
     */
    public function run(): void
    {
        $classifieds = Classified::all();

        if ($classifieds->isEmpty()) {
            $this->command->warn('⚠ No classifieds found. Run ClassifiedSeeder first.');
            return;
        }

        foreach ($classifieds as $classified) {
            // Create 1-5 images per classified
            $imageCount = rand(1, 5);
            ClassifiedImage::factory($imageCount)->create([
                'classified_id' => $classified->id,
            ]);
        }

        $totalImages = ClassifiedImage::count();
        $this->command->info("✓ Total classified images: {$totalImages}");
    }
}


