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
        $price = $this->faker->randomFloat(2, 10, 1000);
        $quantity = $this->faker->numberBetween(1, 10);
        return [
            'order_id' => \App\Models\Order::factory(),
            'product_id' => $this->faker->optional()->randomElement([\App\Models\Product::factory(), null]),
            'product_name' => $this->faker->sentence(),
            'product_description' => $this->faker->optional()->paragraph(),
            'price' => $price,
            'quantity' => $quantity,
            'total' => $price * $quantity,
            'metadata' => $this->faker->optional()->randomElements(['key' => 'value'], 1),
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
