<?php

namespace Database\Factories;

use App\Models\SmbBusiness;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\BusinessPhoto>
 */
class BusinessPhotoFactory extends Factory
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
            'photo_reference' => $this->faker->regexify('[A-Za-z0-9]{100}'),
            'width' => $this->faker->numberBetween(400, 2000),
            'height' => $this->faker->numberBetween(300, 1500),
            'html_attributions' => [],
            'is_primary' => false,
            'display_order' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    /**
     * Indicate that this is the primary photo.
     */
    public function primary(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_primary' => true,
            'display_order' => 0,
        ]);
    }
}
