<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AdImpression>
 */
class AdImpressionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
        public function definition(): array
    {
        return [
            'creative_id' => \App\Models\AdCreative::factory(),
            'placement_id' => \App\Models\AdPlacement::factory(),
            'community_id' => \App\Models\Community::factory(),
            'session_id' => $this->faker->uuid(),
            'ip_hash' => $this->faker->sha256(),
            'user_agent' => $this->faker->userAgent(),
            'referrer' => $this->faker->optional()->url(),
            'cost' => $this->faker->randomFloat(4, 0.001, 0.1),
            'impressed_at' => $this->faker->dateTime(),
        ];
    }
}
