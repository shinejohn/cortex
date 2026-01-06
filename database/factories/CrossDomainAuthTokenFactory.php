<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories.Factory<\App\Models\CrossDomainAuthToken>
 */
class CrossDomainAuthTokenFactory extends Factory
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
            'token' => \Illuminate\Support\Str::random(64),
            'source_domain' => $this->faker->optional()->domainName(),
            'target_domains' => $this->faker->optional()->randomElements([$this->faker->domainName(), $this->faker->domainName()], 2),
            'expires_at' => $this->faker->dateTimeBetween('now', '+1 day'),
            'used' => false,
        ];
    }
}
