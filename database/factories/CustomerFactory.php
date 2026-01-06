<?php

namespace Database\Factories;

use App\Models\Tenant;
use App\Models\SmbBusiness;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Customer>
 */
class CustomerFactory extends Factory
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
            'tenant_id' => Tenant::factory(),
            'smb_business_id' => $this->faker->optional()->randomElement([SmbBusiness::factory(), null]),
            'first_name' => $this->faker->firstName(),
            'last_name' => $this->faker->lastName(),
            'email' => $this->faker->unique()->safeEmail(),
            'phone' => $this->faker->phoneNumber(),
            'lifecycle_stage' => $this->faker->randomElement(['lead', 'mql', 'sql', 'customer']),
            'lead_score' => $this->faker->numberBetween(0, 100),
            'lead_source' => $this->faker->randomElement(['organic', 'paid', 'referral', 'direct']),
            'email_opted_in' => $this->faker->boolean(80),
            'sms_opted_in' => $this->faker->boolean(40),
            'lifetime_value' => $this->faker->randomFloat(2, 0, 10000),
            'tags' => [],
            'custom_fields' => [],
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    /**
     * Indicate that the customer is a lead.
     */
    public function lead(): static
    {
        return $this->state(fn (array $attributes) => [
            'lifecycle_stage' => 'lead',
            'lead_score' => $this->faker->numberBetween(0, 30),
        ]);
    }

    /**
     * Indicate that the customer is a marketing qualified lead.
     */
    public function mql(): static
    {
        return $this->state(fn (array $attributes) => [
            'lifecycle_stage' => 'mql',
            'lead_score' => $this->faker->numberBetween(31, 60),
        ]);
    }

    /**
     * Indicate that the customer is a sales qualified lead.
     */
    public function sql(): static
    {
        return $this->state(fn (array $attributes) => [
            'lifecycle_stage' => 'sql',
            'lead_score' => $this->faker->numberBetween(61, 80),
        ]);
    }

    /**
     * Indicate that the customer is an active customer.
     */
    public function customer(): static
    {
        return $this->state(fn (array $attributes) => [
            'lifecycle_stage' => 'customer',
            'lead_score' => $this->faker->numberBetween(81, 100),
        ]);
    }

    /**
     * Indicate that the customer has opted in to email.
     */
    public function emailOptedIn(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_opted_in' => true,
        ]);
    }

    /**
     * Indicate that the customer has opted in to SMS.
     */
    public function smsOptedIn(): static
    {
        return $this->state(fn (array $attributes) => [
            'sms_opted_in' => true,
        ]);
    }
}
