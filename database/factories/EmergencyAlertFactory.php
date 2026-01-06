<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EmergencyAlert>
 */
class EmergencyAlertFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
        public function definition(): array
    {
        return [
            'uuid' => \Illuminate\Support\Str::uuid(),
            'community_id' => \App\Models\Community::factory(),
            'created_by' => $this->faker->optional()->randomElement([\App\Models\User::factory(), null]),
            'municipal_partner_id' => $this->faker->optional()->randomElement([\App\Models\MunicipalPartner::factory(), null]),
            'priority' => $this->faker->randomElement(['critical', 'urgent', 'advisory', 'info']),
            'category' => $this->faker->randomElement(['weather', 'crime', 'health', 'utility', 'traffic', 'government', 'school', 'amber']),
            'title' => $this->faker->sentence(),
            'message' => $this->faker->paragraph(),
            'instructions' => $this->faker->optional()->paragraph(),
            'source' => $this->faker->optional()->word(),
            'source_url' => $this->faker->optional()->url(),
            'status' => $this->faker->randomElement(['draft', 'active', 'expired', 'cancelled']),
            'published_at' => $this->faker->optional()->dateTime(),
            'expires_at' => $this->faker->optional()->dateTime(),
            'delivery_channels' => $this->faker->optional()->randomElements(['email', 'sms', 'push'], 2),
            'email_sent' => 0,
            'sms_sent' => 0,
        ];
    }
}
