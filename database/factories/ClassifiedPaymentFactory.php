<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ClassifiedPayment>
 */
class ClassifiedPaymentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'classified_id' => \App\Models\Classified::factory(),
            'workspace_id' => \App\Models\Workspace::factory(),
            'stripe_payment_intent_id' => $this->faker->optional()->uuid(),
            'stripe_checkout_session_id' => $this->faker->optional()->uuid(),
            'amount' => $this->faker->numberBetween(500, 20000),
            'currency' => 'usd',
            'status' => $this->faker->randomElement(['pending','paid','failed','refunded']),
            'regions_data' => [],
            'total_days' => $this->faker->numberBetween(7, 30),
        ];
    }
}
