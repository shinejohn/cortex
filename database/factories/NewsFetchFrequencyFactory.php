<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\NewsFetchFrequency;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\NewsFetchFrequency>
 */
final class NewsFetchFrequencyFactory extends Factory
{
    protected $model = NewsFetchFrequency::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = config('news-workflow.business_discovery.categories', [
            'restaurant', 'museum', 'bar', 'night_club', 'library',
        ]);

        return [
            'category' => fake()->randomElement($categories),
            'category_type' => NewsFetchFrequency::CATEGORY_TYPE_NEWS,
            'frequency_type' => NewsFetchFrequency::FREQUENCY_DAILY,
            'custom_interval_days' => null,
            'last_fetched_at' => null,
            'is_enabled' => true,
            'metadata' => null,
        ];
    }

    public function newsCategory(): static
    {
        return $this->state(fn (array $attributes) => [
            'category_type' => NewsFetchFrequency::CATEGORY_TYPE_NEWS,
        ]);
    }

    public function businessCategory(): static
    {
        return $this->state(fn (array $attributes) => [
            'category_type' => NewsFetchFrequency::CATEGORY_TYPE_BUSINESS,
        ]);
    }

    public function daily(): static
    {
        return $this->state(fn (array $attributes) => [
            'frequency_type' => NewsFetchFrequency::FREQUENCY_DAILY,
            'custom_interval_days' => null,
        ]);
    }

    public function weekly(): static
    {
        return $this->state(fn (array $attributes) => [
            'frequency_type' => NewsFetchFrequency::FREQUENCY_WEEKLY,
            'custom_interval_days' => null,
        ]);
    }

    public function monthly(): static
    {
        return $this->state(fn (array $attributes) => [
            'frequency_type' => NewsFetchFrequency::FREQUENCY_MONTHLY,
            'custom_interval_days' => null,
        ]);
    }

    public function customDays(int $days): static
    {
        return $this->state(fn (array $attributes) => [
            'frequency_type' => NewsFetchFrequency::FREQUENCY_CUSTOM_DAYS,
            'custom_interval_days' => $days,
        ]);
    }

    public function disabled(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_enabled' => false,
        ]);
    }

    public function fetchedAt(DateTimeInterface $date): static
    {
        return $this->state(fn (array $attributes) => [
            'last_fetched_at' => $date,
        ]);
    }

    public function neverFetched(): static
    {
        return $this->state(fn (array $attributes) => [
            'last_fetched_at' => null,
        ]);
    }
}
