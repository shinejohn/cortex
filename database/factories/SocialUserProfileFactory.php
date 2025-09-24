<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SocialUserProfile>
 */
final class SocialUserProfileFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'bio' => $this->faker->optional(0.7)->sentence(10),
            'website' => $this->faker->optional(0.3)->url(),
            'location' => $this->faker->optional(0.6)->city(),
            'birth_date' => $this->faker->optional(0.5)->dateTimeBetween('-60 years', '-18 years')?->format('Y-m-d'),
            'profile_visibility' => $this->faker->randomElement(['public', 'friends', 'private']),
            'interests' => $this->faker->optional(0.6)->randomElements([
                'Music', 'Sports', 'Travel', 'Food', 'Technology', 'Art', 'Reading',
                'Gaming', 'Photography', 'Fitness', 'Movies', 'Fashion',
            ], rand(1, 5)),
            'cover_photo' => $this->faker->optional(0.4)->imageUrl(800, 200, 'nature'),
            'social_links' => $this->faker->optional(0.3)->passthrough([
                'twitter' => 'https://twitter.com/'.$this->faker->userName,
                'instagram' => 'https://instagram.com/'.$this->faker->userName,
            ]),
            'show_email' => $this->faker->boolean(20),
            'show_location' => $this->faker->boolean(70),
        ];
    }

    public function publicProfile(): static
    {
        return $this->state(fn (array $attributes) => [
            'profile_visibility' => 'public',
            'show_email' => true,
            'show_location' => true,
        ]);
    }

    public function privateProfile(): static
    {
        return $this->state(fn (array $attributes) => [
            'profile_visibility' => 'private',
            'show_email' => false,
            'show_location' => false,
        ]);
    }
}
