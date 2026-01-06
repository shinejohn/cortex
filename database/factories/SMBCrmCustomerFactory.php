<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SMBCrmCustomer>
 */
class SMBCrmCustomerFactory extends Factory
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
            'first_name' => $this->faker->firstName(),
            'last_name' => $this->faker->lastName(),
            'email' => $this->faker->unique()->safeEmail(),
            'phone' => $this->faker->phoneNumber(),
            'source' => $this->faker->randomElement(['web', 'email', 'referral']),
            'source_details' => [],
            'status' => $this->faker->randomElement(['active', 'inactive', 'prospect']),
            'customer_since' => $this->faker->date(),
            'last_interaction_at' => $this->faker->dateTime(),
            'health_score' => $this->faker->randomElement(['high', 'medium', 'low']),
            'lifetime_value' => $this->faker->randomFloat(2, 0, 10000),
            'predicted_churn_risk' => $this->faker->randomFloat(4, 0, 1),
            'ai_notes' => $this->faker->optional()->paragraph(),
            'preferences' => [],
            'tags' => [],
        ];
    }
}
