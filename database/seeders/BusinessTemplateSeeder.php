<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\BusinessTemplate;
use App\Models\Industry;
use Illuminate\Database\Seeder;

final class BusinessTemplateSeeder extends Seeder
{
    /**
     * Seed business templates.
     */
    public function run(): void
    {
        $industries = Industry::all();

        if ($industries->isEmpty()) {
            $this->command->warn('⚠ No industries found. Run IndustrySeeder first.');
            return;
        }

        // Create templates for each industry
        foreach ($industries as $industry) {
            BusinessTemplate::firstOrCreate(
                [
                    'industry_id' => $industry->id,
                    'name' => $industry->name . ' Template',
                ],
                BusinessTemplate::factory()->make([
                    'industry_id' => $industry->id,
                    'name' => $industry->name . ' Template',
                ])->toArray()
            );
        }

        // Create additional templates using factory
        $existingCount = BusinessTemplate::count();
        $targetCount = 30;

        if ($existingCount < $targetCount) {
            $additionalTemplates = BusinessTemplate::factory($targetCount - $existingCount)->create([
                'industry_id' => fn() => $industries->random()->id,
            ]);

            $this->command->info('✓ Created ' . $additionalTemplates->count() . ' additional templates');
        }

        $totalTemplates = BusinessTemplate::count();
        $this->command->info("✓ Total business templates: {$totalTemplates}");
    }
}


