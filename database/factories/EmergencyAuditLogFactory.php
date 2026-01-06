<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EmergencyAuditLog>
 */
class EmergencyAuditLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
        public function definition(): array
    {
        return [
            'alert_id' => $this->faker->optional()->randomElement([\App\Models\EmergencyAlert::factory(), null]),
            'user_id' => $this->faker->optional()->randomElement([\App\Models\User::factory(), null]),
            'municipal_partner_id' => $this->faker->optional()->randomElement([\App\Models\MunicipalPartner::factory(), null]),
            'action' => $this->faker->randomElement(['created', 'published', 'updated', 'cancelled', 'expired']),
            'changes' => $this->faker->optional()->randomElements(['field' => 'value'], 1),
            'ip_address' => $this->faker->optional()->ipv4(),
            'user_agent' => $this->faker->optional()->userAgent(),
        ];
    }
}
