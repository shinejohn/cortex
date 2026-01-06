<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\BusinessSurvey>
 */
class BusinessSurveyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
        public function definition(): array
    {
        return [
            'business_id' => \App\Models\Business::factory(),
            'name' => $this->faker->sentence(),
            'description' => $this->faker->paragraph(),
            'survey_type' => $this->faker->word(),
            'questions' => $this->faker->word(),
            'trigger_type' => $this->faker->word(),
            'trigger_config' => $this->faker->word(),
            'is_active' => $this->faker->boolean(),
            'responses_count' => $this->faker->numberBetween(0, 100),
            'average_score' => $this->faker->word(),
        ];
    }
}
