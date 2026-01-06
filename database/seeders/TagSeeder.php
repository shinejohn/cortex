<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Tag;
use Illuminate\Database\Seeder;

final class TagSeeder extends Seeder
{
    /**
     * Seed tags.
     */
    public function run(): void
    {
        $tags = [
            'Local News',
            'Breaking News',
            'Politics',
            'Business',
            'Technology',
            'Entertainment',
            'Sports',
            'Weather',
            'Events',
            'Community',
            'Education',
            'Health',
            'Food',
            'Real Estate',
            'Crime',
            'Traffic',
            'Culture',
            'Arts',
            'Music',
            'Theater',
        ];

        foreach ($tags as $tagName) {
            Tag::firstOrCreate(
                ['slug' => \Illuminate\Support\Str::slug($tagName)],
                [
                    'name' => $tagName,
                    'slug' => \Illuminate\Support\Str::slug($tagName),
                ]
            );
        }

        // Create additional tags using factory
        $existingCount = Tag::count();
        $targetCount = 100;

        if ($existingCount < $targetCount) {
            $additionalTags = Tag::factory($targetCount - $existingCount)->create();
            $this->command->info('✓ Created ' . $additionalTags->count() . ' additional tags');
        }

        $totalTags = Tag::count();
        $this->command->info("✓ Total tags: {$totalTags}");
    }
}


