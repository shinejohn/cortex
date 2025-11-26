<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Business;
use App\Models\NewsArticle;
use App\Models\Region;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\NewsArticle>
 */
final class NewsArticleFactory extends Factory
{
    protected $model = NewsArticle::class;

    public function definition(): array
    {
        return [
            'region_id' => Region::factory(),
            'business_id' => null,
            'source_type' => 'category',
            'source_name' => '',
            'title' => fake()->sentence(),
            'url' => fake()->url(),
            'content_snippet' => fake()->paragraph(),
            'full_content' => fake()->paragraphs(3, true),
            'source_publisher' => fake()->company(),
            'published_at' => fake()->dateTimeBetween('-7 days', 'now'),
            'metadata' => [],
            'content_hash' => hash('sha256', fake()->unique()->sentence()),
            'processed' => false,
        ];
    }

    public function forBusiness(Business $business): static
    {
        return $this->state(fn (array $attributes) => [
            'business_id' => $business->id,
            'source_type' => 'business',
            'source_name' => $business->name,
        ]);
    }

    public function processed(): static
    {
        return $this->state(fn (array $attributes) => [
            'processed' => true,
        ]);
    }
}
