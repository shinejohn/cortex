<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PhoneVerification>
 */
class PhoneVerificationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'phone_number' => $this->faker->phoneNumber(),
            'code' => $this->faker->numerify('######'),
            'expires_at' => now()->addMinutes(10),
            'attempts' => 0,
            'verified' => false,
        ];
    }
}
