<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Workspace>
 */
final class WorkspaceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->company();

        return [
            'name' => $name,
            'slug' => Str::slug($name.'Workspace').Str::random(5),
            'owner_id' => User::factory(),
            'timezone' => fake()->timezone(),
            'stripe_connect_id' => null,
            'stripe_charges_enabled' => false,
            'stripe_payouts_enabled' => false,
            'stripe_admin_approved' => false,
        ];
    }

    /**
     * Indicate that the workspace has Stripe Connect enabled
     */
    public function withStripe(): static
    {
        return $this->state(fn (array $attributes) => [
            'stripe_connect_id' => 'acct_'.fake()->bothify('??##??##??##??##'),
            'stripe_charges_enabled' => true,
            'stripe_payouts_enabled' => true,
            'stripe_admin_approved' => true,
        ]);
    }
}
