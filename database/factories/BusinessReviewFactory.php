<?php

namespace Database\Factories;

use App\Models\SmbBusiness;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\BusinessReview>
 */
class BusinessReviewFactory extends Factory
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
            'author_name' => $this->faker->name(),
            'author_url' => $this->faker->optional()->url(),
            'language' => 'en',
            'profile_photo_url' => $this->faker->optional()->imageUrl(),
            'rating' => $this->faker->numberBetween(1, 5),
            'relative_time_description' => $this->faker->randomElement(['2 weeks ago', '1 month ago', '3 months ago', '6 months ago', '1 year ago']),
            'text' => $this->faker->paragraph(),
            'time' => $this->faker->unixTime(),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    /**
     * Indicate that the review is positive (4-5 stars).
     */
    public function positive(): static
    {
        return $this->state(fn (array $attributes) => [
            'rating' => $this->faker->numberBetween(4, 5),
        ]);
    }

    /**
     * Indicate that the review is negative (1-2 stars).
     */
    public function negative(): static
    {
        return $this->state(fn (array $attributes) => [
            'rating' => $this->faker->numberBetween(1, 2),
        ]);
    }
}
