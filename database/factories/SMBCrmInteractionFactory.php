<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SMBCrmInteraction>
 */
class SMBCrmInteractionFactory extends Factory
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
            'customer_id' => \App\Models\SMBCrmCustomer::factory(),
            'interaction_type' => $this->faker->word(),
            'channel' => $this->faker->word(),
            'direction' => $this->faker->word(),
            'subject' => $this->faker->word(),
            'content' => $this->faker->paragraph(),
            'summary' => $this->faker->word(),
            'handled_by' => $this->faker->word(),
            'ai_service_used' => $this->faker->word(),
            'ai_confidence_score' => $this->faker->word(),
            'escalated_reason' => $this->faker->dateTime(),
            'outcome' => $this->faker->word(),
            'sentiment' => $this->faker->word(),
            'duration_seconds' => $this->faker->dateTime(),
            'metadata' => $this->faker->dateTime(),
        ];
    }
}
