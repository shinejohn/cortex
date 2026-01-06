<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\NotificationLog>
 */
class NotificationLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'platform' => $this->faker->randomElement(['daynews', 'goeventcity', 'downtownguide', 'alphasite']),
            'community_id' => $this->faker->optional()->uuid(),
            'notification_type' => $this->faker->randomElement(['breaking_news', 'events', 'deals', 'emergency']),
            'channel' => $this->faker->randomElement(['sms', 'web_push', 'app_push', 'email']),
            'title' => $this->faker->optional()->sentence(),
            'message' => $this->faker->sentence(),
            'payload' => $this->faker->optional()->randomElements(['key' => 'value'], 1),
            'recipient_count' => 0,
            'sns_message_id' => $this->faker->optional()->uuid(),
            'status' => $this->faker->randomElement(['queued', 'sent', 'failed', 'partial']),
            'error_message' => $this->faker->optional()->sentence(),
            'sent_at' => $this->faker->optional()->dateTime(),
        ];
    }
}
