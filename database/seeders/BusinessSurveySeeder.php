<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Business;
use App\Models\BusinessSurvey;
use Illuminate\Database\Seeder;

final class BusinessSurveySeeder extends Seeder
{
    /**
     * Seed business surveys.
     */
    public function run(): void
    {
        $businesses = Business::all();

        if ($businesses->isEmpty()) {
            $this->command->warn('⚠ No businesses found. Run BusinessSeeder first.');
            return;
        }

        foreach ($businesses->take(30) as $business) {
            // Create 1-3 surveys per business
            $surveyCount = rand(1, 3);
            BusinessSurvey::factory($surveyCount)->create([
                'business_id' => $business->id,
            ]);
        }

        $totalSurveys = BusinessSurvey::count();
        $this->command->info("✓ Total business surveys: {$totalSurveys}");
    }
}


