<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EmergencySubscription>
 */
class EmergencySubscriptionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
        public function definition(): array
    {
        return [
            'subscriber_id' => \App\Models\EmailSubscriber::factory(),
            'email_enabled' => $this->faker->boolean(),
            'sms_enabled' => $this->faker->boolean(),
            'phone_number' => $this->faker->optional()->phoneNumber(),
            'phone_verified' => $this->faker->boolean(),
            'phone_verification_code' => $this->faker->optional()->numerify('######'),
            'phone_verified_at' => $this->faker->optional()->dateTime(),
            'priority_levels' => ['critical', 'urgent', 'advisory', 'info'],
            'categories' => [],
            'stripe_subscription_id' => $this->faker->optional()->uuid(),
            'sms_tier' => $this->faker->randomElement(['none', 'basic']),
        ];
    }
}
