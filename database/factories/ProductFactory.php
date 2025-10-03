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
        $productNames = [
            'Wireless Headphones',
            'Vintage Camera',
            'Leather Wallet',
            'Ceramic Mug',
            'Yoga Mat',
            'Running Shoes',
            'Coffee Beans',
            'Art Print',
            'Plant Pot',
            'Desk Lamp',
            'Notebook Set',
            'Tote Bag',
            'Phone Case',
            'Sunglasses',
            'Water Bottle',
            'Scented Candle',
            'Throw Blanket',
            'Wall Clock',
            'Backpack',
            'Tea Collection',
        ];

        $images = [
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1560769629-975ec94e6a86?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1485955900006-10f4d324d411?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1491553895911-0055eca6402d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1588099768523-f4e6a5679d88?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1587829741301-dc798b83add3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1602143407151-7111542de6e8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        ];

        $name = fake()->randomElement($productNames).' - '.fake()->colorName().' '.fake()->randomElement(['Edition', 'Collection', 'Series', 'Style']);
        $price = fake()->randomFloat(2, 9.99, 299.99);
        $hasDiscount = fake()->boolean(30);
        $compareAtPrice = $hasDiscount ? $price * fake()->randomFloat(2, 1.2, 1.8) : null;
        $trackInventory = fake()->boolean(80);

        return [
            'name' => $name,
            'slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(1000, 9999),
            'description' => fake()->paragraph(2),
            'images' => fake()->randomElements($images, fake()->numberBetween(1, 3)),
            'price' => $price,
            'compare_at_price' => $compareAtPrice,
            'quantity' => $trackInventory ? fake()->numberBetween(0, 100) : 0,
            'track_inventory' => $trackInventory,
            'sku' => fake()->optional(0.7)->bothify('SKU-####-????'),
            'is_active' => fake()->boolean(90), // 90% active
            'is_featured' => fake()->boolean(20), // 20% featured
            'stripe_product_id' => null,
            'stripe_price_id' => null,
            'store_id' => null, // Will be set in seeder
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
