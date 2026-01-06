<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EmailSubscriber>
 */
class EmailSubscriberFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
        public function definition(): array
    {
        return [
            'uuid' => \Illuminate\Support\Str::uuid(),
            'email' => $this->faker->unique()->email(),
            'first_name' => $this->faker->optional()->firstName(),
            'last_name' => $this->faker->optional()->lastName(),
            'community_id' => \App\Models\Community::factory(),
            'business_id' => $this->faker->optional()->randomElement([\App\Models\Business::factory(), null]),
            'type' => $this->faker->randomElement(['reader', 'smb']),
            'status' => $this->faker->randomElement(['pending', 'active', 'unsubscribed', 'bounced', 'complained']),
            'confirmed_at' => $this->faker->optional()->dateTime(),
            'unsubscribed_at' => $this->faker->optional()->dateTime(),
            'unsubscribe_reason' => $this->faker->optional()->word(),
            'preferences' => $this->faker->optional()->randomElements(['daily_digest', 'breaking_news', 'weekly_newsletter'], 2),
            'source' => $this->faker->optional()->randomElement(['signup_form', 'import', 'api', 'claim']),
        ];
    }
}
