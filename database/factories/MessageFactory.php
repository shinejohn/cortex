<?php

declare(strict_types=1);

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Message>
 */
final class MessageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'content' => fake()->sentence(fake()->numberBetween(3, 15)),
            'type' => fake()->randomElement(['text', 'image', 'file']),
            'metadata' => fake()->optional(0.3)->randomElements([
                'file_name' => fake()->word().'.jpg',
                'file_size' => fake()->numberBetween(1000, 5000000),
                'mime_type' => fake()->randomElement(['image/jpeg', 'image/png', 'application/pdf']),
            ]),
            'edited_at' => fake()->optional(0.1)->dateTimeBetween('-7 days', 'now'),
        ];
    }

    public function text(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'text',
            'content' => fake()->sentence(fake()->numberBetween(3, 20)),
            'metadata' => null,
        ]);
    }

    public function image(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'image',
            'content' => 'Image shared',
            'metadata' => [
                'file_name' => fake()->word().'.jpg',
                'file_size' => fake()->numberBetween(100000, 2000000),
                'mime_type' => 'image/jpeg',
                'width' => fake()->numberBetween(200, 1920),
                'height' => fake()->numberBetween(200, 1080),
            ],
        ]);
    }

    public function file(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'file',
            'content' => 'File shared',
            'metadata' => [
                'file_name' => fake()->word().'.'.fake()->randomElement(['pdf', 'doc', 'txt']),
                'file_size' => fake()->numberBetween(10000, 10000000),
                'mime_type' => fake()->randomElement(['application/pdf', 'application/msword', 'text/plain']),
            ],
        ]);
    }
}
