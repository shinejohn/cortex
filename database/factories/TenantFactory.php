<?php

namespace Database\Factories;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Tenant>
 */
class TenantFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = $this->faker->company();
        $subdomain = Str::slug($name) . '-' . $this->faker->unique()->randomNumber(5);
        
        return [
            'id' => Str::uuid(),
            'name' => $name,
            'subdomain' => $subdomain,
            'domain' => $this->faker->optional()->domainName(),
            'email' => $this->faker->unique()->companyEmail(),
            'phone' => $this->faker->phoneNumber(),
            'address' => $this->faker->address(),
            'city' => $this->faker->city(),
            'state' => $this->faker->stateAbbr(),
            'postal_code' => $this->faker->postcode(),
            'country' => 'USA',
            'timezone' => $this->faker->randomElement(['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles']),
            'locale' => 'en_US',
            'currency' => 'USD',
            'is_active' => true,
            'trial_ends_at' => $this->faker->optional()->dateTimeBetween('now', '+14 days'),
            'settings' => [],
            'metadata' => [],
        ];
    }

    /**
     * Indicate that the tenant is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Indicate that the tenant is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the tenant is on trial.
     */
    public function onTrial(): static
    {
        return $this->state(fn (array $attributes) => [
            'trial_ends_at' => now()->addDays(14),
        ]);
    }
}
