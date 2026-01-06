<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EmergencyDelivery>
 */
class EmergencyDeliveryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
        public function definition(): array
    {
        return [
            'alert_id' => \App\Models\EmergencyAlert::factory(),
            'subscription_id' => \App\Models\EmergencySubscription::factory(),
            'channel' => $this->faker->randomElement(['email', 'sms']),
            'status' => $this->faker->randomElement(['queued', 'sent', 'delivered', 'failed']),
            'external_id' => $this->faker->optional()->uuid(),
            'sent_at' => $this->faker->optional()->dateTime(),
            'delivered_at' => $this->faker->optional()->dateTime(),
            'error_message' => $this->faker->optional()->text(),
        ];
    }
}
