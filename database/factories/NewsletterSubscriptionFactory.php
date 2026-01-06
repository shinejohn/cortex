<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\NewsletterSubscription>
 */
class NewsletterSubscriptionFactory extends Factory
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
            'tier' => $this->faker->randomElement(['free', 'paid']),
            'price' => 1.00,
            'stripe_subscription_id' => $this->faker->optional()->uuid(),
            'status' => $this->faker->randomElement(['active', 'cancelled', 'past_due', 'paused']),
            'started_at' => now(),
            'cancelled_at' => $this->faker->optional()->dateTime(),
            'current_period_end' => $this->faker->optional()->dateTime(),
        ];
    }
}
