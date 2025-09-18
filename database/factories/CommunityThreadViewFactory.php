<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\CommunityThreadView;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CommunityThreadView>
 */
final class CommunityThreadViewFactory extends Factory
{
    /**
     * The name of the corresponding model.
     *
     * @var class-string<\Illuminate\Database\Eloquent\Model>
     */
    protected $model = CommunityThreadView::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'thread_id' => fake()->uuid(), // Will be overwritten in seeder
            'user_id' => fake()->uuid(), // Will be overwritten in seeder, can be null
            'session_id' => fake()->uuid(), // Will be overwritten in seeder, can be null
            'viewed_at' => fake()->dateTimeBetween('-1 year', 'now'),
        ];
    }

    public function guest(): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => null,
            'session_id' => fake()->uuid(),
        ]);
    }

    public function loggedIn(): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => fake()->uuid(),
            'session_id' => null,
        ]);
    }
}
