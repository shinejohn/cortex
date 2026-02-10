<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\NewsFetchFrequency;
use Illuminate\Database\Seeder;

final class NewsFetchFrequencySeeder extends Seeder
{
    /**
     * Seed news fetch frequencies.
     */
    public function run(): void
    {
        $categories = [
            ['category' => 'Business', 'type' => 'news_category'],
            ['category' => 'Technology', 'type' => 'news_category'],
            ['category' => 'Sports', 'type' => 'news_category'],
            ['category' => 'Entertainment', 'type' => 'news_category'],
            ['category' => 'Local', 'type' => 'news_category'],
            ['category' => 'Politics', 'type' => 'news_category'],
            ['category' => 'Health', 'type' => 'news_category'],
            ['category' => 'Restaurant', 'type' => 'business_category'],
            ['category' => 'Retail', 'type' => 'business_category'],
            ['category' => 'Service', 'type' => 'business_category'],
        ];

        foreach ($categories as $cat) {
            NewsFetchFrequency::firstOrCreate(
                [
                    'category' => $cat['category'],
                    'category_type' => $cat['type'],
                ],
                [
                    'frequency_type' => 'daily', // Default
                    'is_enabled' => true,
                ]
            );
        }

        $totalFrequencies = NewsFetchFrequency::count();
        $this->command->info("✓ Total fetch frequencies: {$totalFrequencies}");
    }
}
