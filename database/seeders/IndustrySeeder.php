<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Industry;
use Illuminate\Database\Seeder;

final class IndustrySeeder extends Seeder
{
    /**
     * Seed industries.
     */
    public function run(): void
    {
        $industries = [
            'Restaurants',
            'Retail',
            'Healthcare',
            'Real Estate',
            'Professional Services',
            'Technology',
            'Entertainment',
            'Hospitality',
            'Education',
            'Automotive',
            'Beauty & Personal Care',
            'Fitness & Recreation',
            'Home Services',
            'Legal Services',
            'Financial Services',
            'Construction',
            'Manufacturing',
            'Transportation',
            'Agriculture',
            'Non-Profit',
        ];

        foreach ($industries as $industryName) {
            Industry::firstOrCreate(
                ['name' => $industryName],
                ['name' => $industryName]
            );
        }

        // Create additional industries using factory
        $existingCount = Industry::count();
        $targetCount = 30;

        if ($existingCount < $targetCount) {
            $additionalIndustries = Industry::factory($targetCount - $existingCount)->create();
            $this->command->info('✓ Created ' . $additionalIndustries->count() . ' additional industries');
        }

        $totalIndustries = Industry::count();
        $this->command->info("✓ Total industries: {$totalIndustries}");
    }
}


