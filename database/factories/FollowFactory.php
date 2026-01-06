<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Follow>
 */
class FollowFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
        public function definition(): array
    {
        $followableTypes = [
            \App\Models\Event::class,
            \App\Models\Performer::class,
            \App\Models\Venue::class,
            \App\Models\Calendar::class,
            \App\Models\User::class,
        ];
        $followableType = $this->faker->randomElement($followableTypes);
        
        return [
            'user_id' => \App\Models\User::factory(),
            'followable_type' => $followableType,
            'followable_id' => $followableType::factory(),
        ];
    }
}
