<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\BusinessSurvey;
use App\Models\BusinessSurveyResponse;
use Illuminate\Database\Seeder;

final class BusinessSurveyResponseSeeder extends Seeder
{
    /**
     * Seed business survey responses.
     */
    public function run(): void
    {
        $surveys = BusinessSurvey::all();
        $customers = \App\Models\SMBCrmCustomer::all();

        if ($surveys->isEmpty() || $customers->isEmpty()) {
            $this->command->warn('⚠ No surveys or customers found. Run BusinessSurveySeeder and SMBCrmCustomerSeeder first.');

            return;
        }

        foreach ($surveys as $survey) {
            // Create 5-20 responses per survey
            $responseCount = rand(5, 20);
            $availableCustomers = $customers->random(min($responseCount, $customers->count()));

            foreach ($availableCustomers as $customer) {
                BusinessSurveyResponse::firstOrCreate(
                    [
                        'survey_id' => $survey->id,
                        'customer_id' => $customer->id,
                    ],
                    BusinessSurveyResponse::factory()->make([
                        'survey_id' => $survey->id,
                        'business_id' => $survey->business_id,
                        'customer_id' => $customer->id,
                    ])->toArray()
                );
            }

        }

        $totalResponses = BusinessSurveyResponse::count();
        $this->command->info("✓ Total survey responses: {$totalResponses}");
    }
}
