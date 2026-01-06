<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories.Factory<\App\Models\ClassifiedImage>
 */
class ClassifiedImageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'classified_id' => \App\Models\Classified::factory(),
            'image_path' => $this->faker->imageUrl(),
            'image_disk' => 'public',
            'order' => $this->faker->numberBetween(0, 5),
        ];
    }
}
