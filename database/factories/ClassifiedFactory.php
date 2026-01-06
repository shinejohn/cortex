<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Classified>
 */
class ClassifiedFactory extends Factory
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
            'workspace_id' => \App\Models\Workspace::factory(),
            'category' => $this->faker->randomElement(['for_sale','housing','jobs','services','community','personals']),
            'subcategory' => $this->faker->optional()->word(),
            'title' => $this->faker->sentence(),
            'description' => $this->faker->paragraph(),
            'price' => $this->faker->randomFloat(2, 0, 1000),
            'price_type' => $this->faker->randomElement(['fixed','negotiable','contact_for_pricing']),
            'condition' => $this->faker->randomElement(['new','like_new','excellent','good','fair','poor']),
            'location' => $this->faker->city(),
            'is_featured' => $this->faker->boolean(10),
            'status' => $this->faker->randomElement(['draft','pending_payment','active','expired','sold','removed']),
            'posted_at' => $this->faker->dateTimeBetween('-10 days','now'),
            'expires_at' => $this->faker->optional()->dateTimeBetween('now','+30 days'),
            'views_count' => $this->faker->numberBetween(0, 100),
        ];
    }
}
