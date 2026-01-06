<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CheckIn>
 */
class CheckInFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
        public function definition(): array
    {
        return [
            'event_id' => \App\Models\Event::factory(),
            'user_id' => \App\Models\User::factory(),
            'checked_in_at' => $this->faker->dateTime(),
            'location' => $this->faker->dateTime(),
            'latitude' => $this->faker->dateTime(),
            'longitude' => $this->faker->word(),
            'notes' => $this->faker->word(),
            'is_public' => $this->faker->boolean(),
        ];
    }
}
