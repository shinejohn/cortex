<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\BusinessSurveyResponse>
 */
class BusinessSurveyResponseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
        public function definition(): array
    {
        return [
            'survey_id' => \App\Models\BusinessSurvey::factory(),
            'business_id' => \App\Models\Business::factory(),
            'customer_id' => \App\Models\SMBCrmCustomer::factory(),
            'responses' => [
                'q1' => $this->faker->sentence(),
                'q2' => $this->faker->numberBetween(1, 5),
            ],
            'overall_score' => $this->faker->randomFloat(2, 1, 5),
            'sentiment' => $this->faker->randomElement(['positive', 'neutral', 'negative']),
            'ai_summary' => $this->faker->optional()->paragraph(),
            'action_items' => [],
            'completed_at' => now(),
            'source' => $this->faker->randomElement(['email', 'sms', 'web']),
        ];
    }
}

