<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PlannedEvent>
 */
class PlannedEventFactory extends Factory
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
            'planned_at' => $this->faker->dateTime(),
            'reminder_sent' => $this->faker->word(),
            'reminder_sent_at' => $this->faker->dateTime(),
            'notes' => $this->faker->word(),
        ];
    }
}
