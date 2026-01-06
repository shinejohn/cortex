<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\BusinessSubscription>
 */
class BusinessSubscriptionFactory extends Factory
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
            'tier' => $this->faker->randomElement(['trial', 'basic', 'standard', 'premium', 'enterprise']),
            'status' => $this->faker->randomElement(['active', 'expired', 'cancelled', 'suspended']),
            'trial_started_at' => $this->faker->dateTimeBetween('-10 days', 'now'),
            'trial_expires_at' => $this->faker->dateTimeBetween('now', '+30 days'),
            'trial_converted_at' => $this->faker->dateTime(),
            'subscription_started_at' => $this->faker->dateTime(),
            'subscription_expires_at' => $this->faker->dateTime(),
            'auto_renew' => $this->faker->boolean(),
            'stripe_subscription_id' => $this->faker->optional()->uuid(),
            'stripe_customer_id' => $this->faker->optional()->uuid(),
            'monthly_amount' => $this->faker->randomFloat(2, 0, 1000),
            'billing_cycle' => $this->faker->randomElement(['monthly', 'annual']),
            'ai_services_enabled' => [],
            'claimed_by_id' => $this->faker->optional()->randomElement([\App\Models\User::factory(), null]),
            'claimed_at' => $this->faker->optional()->dateTime(),
            'downgraded_at' => $this->faker->optional()->dateTime(),
        ];
    }
}
