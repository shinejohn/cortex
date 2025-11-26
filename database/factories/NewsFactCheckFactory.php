<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\NewsArticleDraft;
use App\Models\NewsFactCheck;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\NewsFactCheck>
 */
final class NewsFactCheckFactory extends Factory
{
    protected $model = NewsFactCheck::class;

    public function definition(): array
    {
        return [
            'draft_id' => NewsArticleDraft::factory(),
            'claim' => fake()->sentence(),
            'verification_result' => 'verified',
            'confidence_score' => fake()->randomFloat(2, 70, 100),
            'sources' => [fake()->url(), fake()->url()],
            'scraped_evidence' => [
                [
                    'url' => fake()->url(),
                    'claim_found' => true,
                    'evidence' => fake()->paragraph(),
                    'scraped_at' => now()->toIso8601String(),
                ],
            ],
            'metadata' => [
                'search_query' => fake()->sentence(),
                'total_sources_checked' => 2,
                'sources_with_evidence' => 2,
            ],
        ];
    }

    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'verification_result' => 'unverified',
            'confidence_score' => fake()->randomFloat(2, 40, 69),
        ]);
    }

    public function contradicted(): static
    {
        return $this->state(fn (array $attributes) => [
            'verification_result' => 'contradicted',
            'confidence_score' => fake()->randomFloat(2, 0, 39),
        ]);
    }
}
