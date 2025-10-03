<?php

declare(strict_types=1);

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\OrderItem>
 */
final class OrderItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $quantity = fake()->numberBetween(1, 5);
        $price = fake()->randomFloat(2, 9.99, 199.99);
        $total = $price * $quantity;

        return [
            'product_name' => fake()->words(3, true),
            'product_description' => fake()->optional(0.7)->sentence(),
            'price' => $price,
            'quantity' => $quantity,
            'total' => $total,
            'order_id' => null, // Will be set in seeder
            'product_id' => null, // Will be set in seeder
        ];
    }

    /**
     * Indicate that the item is from a specific product
     */
    public function forProduct(\App\Models\Product $product): static
    {
        return $this->state(fn (array $attributes) => [
            'product_id' => $product->id,
            'product_name' => $product->name,
            'product_description' => $product->description,
            'price' => $product->price,
        ]);
    }
}
