<?php

declare(strict_types=1);

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
final class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
        public function definition(): array
    {
        return [
            'store_id' => \App\Models\Store::factory(),
            'name' => $this->faker->sentence(),
            'slug' => $this->faker->slug(),
            'description' => $this->faker->paragraph(),
            'images' => [$this->faker->imageUrl()],
            'price' => $this->faker->randomFloat(2, 5, 500),
            'compare_at_price' => $this->faker->optional()->randomFloat(2, 5, 800),
            'quantity' => $this->faker->numberBetween(0, 100),
            'track_inventory' => $this->faker->boolean(),
            'sku' => $this->faker->unique()->bothify('SKU-#####'),
            'is_active' => $this->faker->boolean(90),
            'is_featured' => $this->faker->boolean(10),
            'stripe_price_id' => $this->faker->optional()->uuid(),
            'stripe_product_id' => $this->faker->optional()->uuid(),
            'metadata' => [],
        ];
    }

    /**
     * Indicate that the product is active
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Indicate that the product is featured
     */
    public function featured(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_featured' => true,
        ]);
    }

    /**
     * Indicate that the product is out of stock
     */
    public function outOfStock(): static
    {
        return $this->state(fn (array $attributes) => [
            'quantity' => 0,
            'track_inventory' => true,
        ]);
    }

    /**
     * Indicate that the product has a discount
     */
    public function onSale(): static
    {
        return $this->state(function (array $attributes) {
            $price = $attributes['price'] ?? 50.00;

            return [
                'compare_at_price' => $price * fake()->randomFloat(2, 1.3, 1.7),
            ];
        });
    }

    /**
     * Indicate that the product has unlimited stock
     */
    public function unlimitedStock(): static
    {
        return $this->state(fn (array $attributes) => [
            'track_inventory' => false,
            'quantity' => 0,
        ]);
    }
}
