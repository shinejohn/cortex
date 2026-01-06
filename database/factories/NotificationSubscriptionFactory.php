<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\NotificationSubscription>
 */
class NotificationSubscriptionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => \App\Models\User::factory(),
            'platform' => $this->faker->randomElement(['daynews', 'goeventcity', 'downtownguide', 'alphasite']),
            'community_id' => $this->faker->optional()->uuid(),
            'business_id' => $this->faker->optional()->uuid(),
            'phone_number' => $this->faker->optional()->phoneNumber(),
            'phone_verified' => false,
            'phone_verified_at' => $this->faker->optional()->dateTime(),
            'web_push_endpoint' => $this->faker->optional()->url(),
            'web_push_p256dh' => $this->faker->optional()->sha256(),
            'web_push_auth' => $this->faker->optional()->sha256(),
            'sns_sms_subscription_arn' => $this->faker->optional()->uuid(),
            'sns_endpoint_arn' => $this->faker->optional()->uuid(),
            'notification_types' => ['breaking_news', 'events', 'deals'],
            'frequency' => $this->faker->randomElement(['instant', 'daily_digest', 'weekly_digest']),
            'quiet_hours_start' => '22:00',
            'quiet_hours_end' => '08:00',
            'status' => $this->faker->randomElement(['active', 'paused', 'unsubscribed']),
            'last_notification_at' => $this->faker->optional()->dateTime(),
        ];
    }
}
