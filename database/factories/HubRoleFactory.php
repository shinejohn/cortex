<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\HubRole>
 */
class HubRoleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'hub_id' => \App\Models\Hub::factory(),
            'name' => $this->faker->randomElement(['Admin', 'Moderator', 'Editor', 'Member']),
            'slug' => $this->faker->unique()->slug(),
            'description' => $this->faker->optional()->sentence(),
            'permissions' => $this->faker->optional()->randomElements(['read' => true, 'write' => true], 1),
            'is_system' => false,
            'sort_order' => 0,
        ];
    }
}
