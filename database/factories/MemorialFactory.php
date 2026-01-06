<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Memorial>
 */
class MemorialFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
        public function definition(): array
    {
        $birthYear = $this->faker->numberBetween(1920, 2000);
        $deathYear = $this->faker->numberBetween(2000, 2024);
        return [
            'user_id' => \App\Models\User::factory(),
            'workspace_id' => $this->faker->optional()->randomElement([\App\Models\Workspace::factory(), null]),
            'name' => $this->faker->name(),
            'years' => "{$birthYear} - {$deathYear}",
            'date_of_passing' => $this->faker->date(),
            'obituary' => $this->faker->paragraph(),
            'image' => $this->faker->optional()->imageUrl(),
            'location' => $this->faker->optional()->city(),
            'service_date' => $this->faker->optional()->date(),
            'service_location' => $this->faker->optional()->address(),
            'service_details' => $this->faker->optional()->paragraph(),
            'is_featured' => false,
            'status' => $this->faker->randomElement(['draft', 'published', 'removed']),
            'published_at' => $this->faker->optional()->dateTime(),
            'views_count' => 0,
            'reactions_count' => 0,
            'comments_count' => 0,
        ];
    }
}
