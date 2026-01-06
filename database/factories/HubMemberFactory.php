<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\HubMember>
 */
class HubMemberFactory extends Factory
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
            'user_id' => \App\Models\User::factory(),
            'role' => $this->faker->randomElement(['member', 'admin', 'moderator']),
            'permissions' => $this->faker->optional()->randomElements(['read' => true, 'write' => false], 1),
            'joined_at' => now(),
            'is_active' => true,
        ];
    }
}
