<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Event;
use App\Models\EventExtractionDraft;
use App\Models\NewsArticle;
use App\Models\Performer;
use App\Models\Region;
use App\Models\Venue;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EventExtractionDraft>
 */
final class EventExtractionDraftFactory extends Factory
{
    protected $model = EventExtractionDraft::class;

    public function definition(): array
    {
        return [
            'news_article_id' => NewsArticle::factory(),
            'region_id' => Region::factory(),
            'status' => 'pending',
            'detection_confidence' => $this->faker->randomFloat(2, 60, 100),
            'extraction_confidence' => null,
            'quality_score' => null,
            'extracted_data' => null,
            'matched_venue_id' => null,
            'matched_performer_id' => null,
            'published_event_id' => null,
            'ai_metadata' => [
                'detection' => [
                    'contains_event' => true,
                    'confidence_score' => $this->faker->numberBetween(60, 100),
                    'event_date_mentioned' => true,
                    'rationale' => 'Test detection rationale',
                ],
            ],
            'rejection_reason' => null,
        ];
    }

    public function detected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'detected',
            'detection_confidence' => $this->faker->randomFloat(2, 60, 100),
        ]);
    }

    public function extracted(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'extracted',
            'detection_confidence' => $this->faker->randomFloat(2, 60, 100),
            'extraction_confidence' => $this->faker->randomFloat(2, 70, 100),
            'extracted_data' => $this->generateExtractedData(),
        ]);
    }

    public function validated(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'validated',
            'detection_confidence' => $this->faker->randomFloat(2, 60, 100),
            'extraction_confidence' => $this->faker->randomFloat(2, 70, 100),
            'quality_score' => $this->faker->randomFloat(2, 75, 100),
            'extracted_data' => $this->generateExtractedData(),
            'matched_venue_id' => null, // Set via withVenue() method
        ]);
    }

    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'published',
            'detection_confidence' => $this->faker->randomFloat(2, 60, 100),
            'extraction_confidence' => $this->faker->randomFloat(2, 70, 100),
            'quality_score' => $this->faker->randomFloat(2, 85, 100),
            'extracted_data' => $this->generateExtractedData(),
            'matched_venue_id' => null, // Set via withVenue() method
            'published_event_id' => null, // Set via withPublishedEvent() method
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'rejected',
            'rejection_reason' => $this->faker->sentence(),
        ]);
    }

    public function withVenue(?Venue $venue = null): static
    {
        return $this->state(fn (array $attributes) => [
            'matched_venue_id' => $venue?->id ?? Venue::factory(),
        ]);
    }

    public function withPerformer(?Performer $performer = null): static
    {
        return $this->state(fn (array $attributes) => [
            'matched_performer_id' => $performer?->id ?? Performer::factory(),
        ]);
    }

    public function withPublishedEvent(?Event $event = null): static
    {
        return $this->state(fn (array $attributes) => [
            'published_event_id' => $event?->id ?? Event::factory(),
        ]);
    }

    public function forRegion(Region $region): static
    {
        return $this->state(fn (array $attributes) => [
            'region_id' => $region->id,
        ]);
    }

    public function forArticle(NewsArticle $article): static
    {
        return $this->state(fn (array $attributes) => [
            'news_article_id' => $article->id,
        ]);
    }

    private function generateExtractedData(): array
    {
        $categories = ['music', 'festival', 'sports', 'arts', 'business', 'community', 'food-drink', 'charity', 'family', 'nightlife'];

        return [
            'title' => $this->faker->sentence(4),
            'event_date' => now()->addDays($this->faker->numberBetween(1, 30))->toIso8601String(),
            'time' => $this->faker->time('g:i A').' - '.$this->faker->time('g:i A'),
            'venue_name' => $this->faker->company().' '.$this->faker->randomElement(['Theater', 'Arena', 'Hall', 'Stadium', 'Center']),
            'venue_address' => $this->faker->address(),
            'description' => $this->faker->paragraph(3),
            'category' => $this->faker->randomElement($categories),
            'subcategories' => $this->faker->randomElements(['live-music', 'outdoor', 'family-friendly', 'local-artists', 'food-vendors'], 2),
            'is_free' => $this->faker->boolean(30),
            'price_min' => $this->faker->randomFloat(2, 10, 50),
            'price_max' => $this->faker->randomFloat(2, 50, 200),
            'performer_name' => $this->faker->boolean(60) ? $this->faker->name() : null,
            'badges' => $this->faker->randomElements(['featured', 'family-friendly', 'outdoor', '21+', 'food-included'], $this->faker->numberBetween(0, 2)),
            'extraction_confidence' => $this->faker->numberBetween(70, 100),
        ];
    }
}
