<?php

namespace Database\Factories;

use App\Models\SmbBusiness;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\BusinessAttribute>
 */
class BusinessAttributeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id' => Str::uuid(),
            'smb_business_id' => SmbBusiness::factory(),
            'attribute_key' => $this->faker->randomElement([
                'wheelchair_accessible_entrance',
                'wheelchair_accessible_restroom',
                'wheelchair_accessible_seating',
                'restroom',
                'parking',
                'payment_options',
                'dining_options',
                'takeout',
                'delivery',
                'reservations',
            ]),
            'attribute_value' => $this->faker->boolean() ? 'true' : 'false',
            'attribute_type' => $this->faker->randomElement(['boolean', 'string', 'array']),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
