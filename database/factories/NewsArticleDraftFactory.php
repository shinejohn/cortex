<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\NewsArticle;
use App\Models\NewsArticleDraft;
use App\Models\Region;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\NewsArticleDraft>
 */
final class NewsArticleDraftFactory extends Factory
{
    protected $model = NewsArticleDraft::class;

    public function definition(): array
    {
        return [
            'news_article_id' => NewsArticle::factory(),
            'region_id' => Region::factory(),
            'status' => 'shortlisted',
            'relevance_score' => fake()->randomFloat(2, 60, 100),
            'quality_score' => null,
            'fact_check_confidence' => null,
            'topic_tags' => ['local', 'news'],
            'outline' => null,
            'generated_title' => null,
            'generated_content' => null,
            'generated_excerpt' => null,
            'seo_metadata' => null,
            'featured_image_url' => null,
            'ai_metadata' => null,
            'published_post_id' => null,
            'rejection_reason' => null,
        ];
    }

    public function readyForGeneration(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'ready_for_generation',
            'outline' => '# Test Outline\n\n## Introduction\n## Main Content\n## Conclusion',
            'fact_check_confidence' => fake()->randomFloat(2, 70, 95),
        ]);
    }

    public function readyForPublishing(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'ready_for_publishing',
            'quality_score' => fake()->randomFloat(2, 75, 100),
            'fact_check_confidence' => fake()->randomFloat(2, 80, 95),
            'generated_title' => fake()->sentence(),
            'generated_content' => fake()->paragraphs(5, true),
            'generated_excerpt' => fake()->paragraph(),
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'rejected',
            'rejection_reason' => 'Failed quality check',
        ]);
    }
}
