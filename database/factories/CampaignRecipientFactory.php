<?php

namespace Database\Factories;

use App\Models\Campaign;
use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CampaignRecipient>
 */
class CampaignRecipientFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id' => Str::uuid(),
            'campaign_id' => Campaign::factory(),
            'customer_id' => Customer::factory(),
            'status' => $this->faker->randomElement(['pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed']),
            'sent_at' => $this->faker->optional()->dateTime(),
            'delivered_at' => $this->faker->optional()->dateTime(),
            'opened_at' => $this->faker->optional()->dateTime(),
            'clicked_at' => $this->faker->optional()->dateTime(),
            'bounced_at' => null,
            'unsubscribed_at' => null,
            'metadata' => [],
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    /**
     * Indicate that the recipient opened the campaign.
     */
    public function opened(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'opened',
            'sent_at' => $this->faker->dateTimeBetween('-7 days', 'now'),
            'delivered_at' => $this->faker->dateTimeBetween('-7 days', 'now'),
            'opened_at' => $this->faker->dateTimeBetween('-6 days', 'now'),
        ]);
    }

    /**
     * Indicate that the recipient clicked the campaign.
     */
    public function clicked(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'clicked',
            'sent_at' => $this->faker->dateTimeBetween('-7 days', 'now'),
            'delivered_at' => $this->faker->dateTimeBetween('-7 days', 'now'),
            'opened_at' => $this->faker->dateTimeBetween('-6 days', 'now'),
            'clicked_at' => $this->faker->dateTimeBetween('-5 days', 'now'),
        ]);
    }

    /**
     * Indicate that the recipient bounced.
     */
    public function bounced(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'bounced',
            'sent_at' => $this->faker->dateTimeBetween('-7 days', 'now'),
            'bounced_at' => $this->faker->dateTimeBetween('-6 days', 'now'),
        ]);
    }
}
