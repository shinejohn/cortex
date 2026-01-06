<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\BusinessSurvey;
use App\Models\BusinessSurveyResponse;
use App\Models\User;
use Illuminate\Database\Seeder;

final class BusinessSurveyResponseSeeder extends Seeder
{
    /**
     * Seed business survey responses.
     */
    public function run(): void
    {
        $surveys = BusinessSurvey::all();
        $users = User::all();

        if ($surveys->isEmpty() || $users->isEmpty()) {
            $this->command->warn('⚠ No surveys or users found. Run BusinessSurveySeeder and UserSeeder first.');
            return;
        }

        foreach ($surveys as $survey) {
            // Create 5-20 responses per survey
            $responseCount = rand(5, 20);
            $availableUsers = $users->random(min($responseCount, $users->count()));

            foreach ($availableUsers as $user) {
                BusinessSurveyResponse::firstOrCreate(
                    [
                        'survey_id' => $survey->id,
                        'user_id' => $user->id,
                    ],
                    BusinessSurveyResponse::factory()->make([
                        'survey_id' => $survey->id,
                        'user_id' => $user->id,
                    ])->toArray()
                );
            }
        }

        $totalResponses = BusinessSurveyResponse::count();
        $this->command->info("✓ Total survey responses: {$totalResponses}");
    }
}


