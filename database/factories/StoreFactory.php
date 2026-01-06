<?php

declare(strict_types=1);

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Store>
 */
final class StoreFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $storeNames = [
            'Vintage Finds',
            'Artisan Crafts',
            'Tech Haven',
            'Book Nook',
            'Fashion Forward',
            'Home & Garden',
            'Sports Gear',
            'Music Shop',
            'Art Supplies',
            'Eco Essentials',
            'Gourmet Foods',
            'Pet Paradise',
            'Coffee Corner',
            'Wellness Store',
            'Outdoor Adventure',
        ];

        $name = fake()->randomElement($storeNames).' '.fake()->randomElement(['Co.', 'Shop', 'Boutique', 'Market', 'Emporium', 'Studio']);

        return [
            'name' => $name,
            'slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(100, 999),
            'description' => fake()->paragraph(3),
            'logo' => fake()->optional(0.7)->passthrough('https://api.dicebear.com/7.x/initials/svg?seed='.urlencode($name).'&backgroundColor='.mb_substr(md5($name), 0, 6)),
            'banner' => fake()->optional(0.8)->passthrough('https://images.unsplash.com/photo-'.fake()->randomElement([
                '1441986300917-64674bd600d8',
                '1472851294608-062f824d29cc',
                '1534452203293-494d7ddbf7e0',
                '1556742049-0cfed4f6a45d',
                '1607082348824-0a96f2a4b9da',
                '1607082349566-187780aea5d4',
                '1586880244386-8b3e34c7e4b',
            ]).'?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'),
            'status' => fake()->randomElement(['pending', 'approved', 'approved', 'approved']), // 75% approved
            'rejection_reason' => null,
            'approved_at' => null,
            'workspace_id' => \App\Models\Workspace::factory(),
        ];
    }

    /**
     * Indicate that the store is approved
     */
    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'approved',
            'approved_at' => fake()->dateTimeBetween('-60 days', '-1 day'),
        ]);
    }

    /**
     * Indicate that the store is rejected
     */
    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'rejected',
            'rejection_reason' => fake()->randomElement([
                'Incomplete store information provided.',
                'Store name violates our terms of service.',
                'Unable to verify business registration.',
                'Store category not supported at this time.',
            ]),
        ]);
    }

    /**
     * Indicate that the store is pending
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
        ]);
    }
}
