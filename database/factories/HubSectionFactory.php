<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\HubSection>
 */
class HubSectionFactory extends Factory
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
            'type' => $this->faker->randomElement(['about', 'events', 'articles', 'gallery', 'community']),
            'title' => $this->faker->sentence(),
            'description' => $this->faker->optional()->paragraph(),
            'content' => $this->faker->optional()->randomElements(['key' => 'value'], 1),
            'settings' => $this->faker->optional()->randomElements(['visible' => true], 1),
            'is_visible' => true,
            'sort_order' => 0,
        ];
    }
}
