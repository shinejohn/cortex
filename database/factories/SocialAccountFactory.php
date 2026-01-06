<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SocialAccount>
 */
class SocialAccountFactory extends Factory
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
            'provider' => $this->faker->randomElement(['google', 'facebook', 'twitter', 'linkedin', 'instagram']),
            'provider_id' => $this->faker->uuid(),
            'name' => $this->faker->name(),
            'token' => Str::random(40), // Encrypted field - use random string
            'refresh_token' => Str::random(40), // Encrypted field - use random string
            'avatar' => $this->faker->optional()->imageUrl(),
            'code' => $this->faker->optional()->word(),
            'expires_at' => $this->faker->optional()->dateTimeBetween('now', '+1 year'),
        ];
    }

    /**
     * Indicate that the account is from Google.
     */
    public function google(): static
    {
        return $this->state(fn (array $attributes) => [
            'provider' => 'google',
        ]);
    }

    /**
     * Indicate that the account is from Facebook.
     */
    public function facebook(): static
    {
        return $this->state(fn (array $attributes) => [
            'provider' => 'facebook',
        ]);
    }
}
