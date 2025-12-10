<?php

declare(strict_types=1);

namespace App\Services\News;

use App\Models\NewsFetchFrequency;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

final class FetchFrequencyService
{
    /**
     * Get news categories that should be fetched today.
     *
     * @return Collection<int, string>
     */
    public function getCategoriesForToday(): Collection
    {
        $configCategories = config('news-workflow.business_discovery.categories', []);

        return collect($configCategories)->filter(function (string $category) {
            return $this->shouldFetchCategory($category, NewsFetchFrequency::CATEGORY_TYPE_NEWS);
        })->values();
    }

    /**
     * Check if a specific category should be fetched today.
     */
    public function shouldFetchCategory(string $category, string $categoryType): bool
    {
        // Check database first (admin overrides take priority)
        $dbConfig = NewsFetchFrequency::query()
            ->forCategory($category, $categoryType)
            ->first();

        if ($dbConfig) {
            return $dbConfig->shouldFetchToday();
        }

        // Fall back to config defaults
        return $this->shouldFetchFromConfig($category, $categoryType);
    }

    /**
     * Filter businesses by their category fetch frequencies.
     *
     * @param  Collection<int, \App\Models\Business>  $businesses
     * @return Collection<int, \App\Models\Business>
     */
    public function filterBusinessesByFrequency(Collection $businesses): Collection
    {
        return $businesses->filter(function ($business) {
            $categories = $business->categories ?? [];

            // If business has any category that should be fetched today, include it
            foreach ($categories as $category) {
                if ($this->shouldFetchCategory($category, NewsFetchFrequency::CATEGORY_TYPE_BUSINESS)) {
                    return true;
                }
            }

            // If no categories defined, use the default frequency
            if (empty($categories)) {
                return $this->shouldFetchFromDefault(NewsFetchFrequency::CATEGORY_TYPE_BUSINESS);
            }

            return false;
        });
    }

    /**
     * Mark a category as fetched (update last_fetched_at).
     */
    public function markCategoryFetched(string $category, string $categoryType): void
    {
        NewsFetchFrequency::query()->updateOrCreate(
            ['category' => $category, 'category_type' => $categoryType],
            [
                'last_fetched_at' => now(),
                'frequency_type' => $this->getDefaultFrequencyType($category, $categoryType),
                'custom_interval_days' => $this->getDefaultCustomDays($category, $categoryType),
                'is_enabled' => true,
            ]
        );

        Log::debug('Marked category as fetched', [
            'category' => $category,
            'category_type' => $categoryType,
        ]);
    }

    /**
     * Sync default frequencies from config to database.
     *
     * @return int Number of records synced
     */
    public function syncDefaultFrequencies(): int
    {
        $synced = 0;

        // Sync news categories
        $newsCategories = config('news-workflow.fetch_frequencies.news_categories', []);
        foreach ($newsCategories as $category => $frequency) {
            $this->syncCategoryFrequency($category, NewsFetchFrequency::CATEGORY_TYPE_NEWS, $frequency);
            $synced++;
        }

        // Sync business categories
        $businessCategories = config('news-workflow.fetch_frequencies.business_categories', []);
        foreach ($businessCategories as $category => $frequency) {
            $this->syncCategoryFrequency($category, NewsFetchFrequency::CATEGORY_TYPE_BUSINESS, $frequency);
            $synced++;
        }

        // Also sync any categories from the business_discovery list that don't have explicit frequencies
        $allCategories = config('news-workflow.business_discovery.categories', []);
        foreach ($allCategories as $category) {
            if (! isset($newsCategories[$category])) {
                $this->syncCategoryFrequency($category, NewsFetchFrequency::CATEGORY_TYPE_NEWS, 'daily');
                $synced++;
            }
        }

        Log::info('Synced default fetch frequencies', ['count' => $synced]);

        return $synced;
    }

    /**
     * Get all configured categories with their current fetch status.
     *
     * @return Collection<int, array{category: string, type: string, should_fetch: bool, last_fetched_at: ?\Carbon\Carbon, frequency: string}>
     */
    public function getCategoryStatus(): Collection
    {
        $configCategories = config('news-workflow.business_discovery.categories', []);

        return collect($configCategories)->map(function (string $category) {
            $dbConfig = NewsFetchFrequency::query()
                ->forCategory($category, NewsFetchFrequency::CATEGORY_TYPE_NEWS)
                ->first();

            return [
                'category' => $category,
                'type' => NewsFetchFrequency::CATEGORY_TYPE_NEWS,
                'should_fetch' => $this->shouldFetchCategory($category, NewsFetchFrequency::CATEGORY_TYPE_NEWS),
                'last_fetched_at' => $dbConfig?->last_fetched_at,
                'frequency' => $dbConfig?->frequency_type ?? $this->getDefaultFrequencyType($category, NewsFetchFrequency::CATEGORY_TYPE_NEWS),
            ];
        });
    }

    /**
     * Check if category should be fetched based on config defaults.
     */
    private function shouldFetchFromConfig(string $category, string $categoryType): bool
    {
        $configKey = $categoryType === NewsFetchFrequency::CATEGORY_TYPE_NEWS
            ? 'news-workflow.fetch_frequencies.news_categories'
            : 'news-workflow.fetch_frequencies.business_categories';

        $frequencyConfig = config($configKey, []);
        $frequency = $frequencyConfig[$category] ?? config('news-workflow.fetch_frequencies.default', 'daily');

        // Parse frequency configuration
        [$frequencyType, $customDays] = $this->parseFrequencyConfig($frequency);

        // For config-only categories (no DB record), we need to check the DB for last_fetched_at
        $dbConfig = NewsFetchFrequency::query()
            ->forCategory($category, $categoryType)
            ->first();

        if (! $dbConfig) {
            // Never fetched, should fetch
            return true;
        }

        // Use the DB record to check timing but with config frequency
        $intervalDays = match ($frequencyType) {
            NewsFetchFrequency::FREQUENCY_DAILY => 1,
            NewsFetchFrequency::FREQUENCY_WEEKLY => 7,
            NewsFetchFrequency::FREQUENCY_MONTHLY => 30,
            NewsFetchFrequency::FREQUENCY_CUSTOM_DAYS => $customDays ?? 1,
            default => 1,
        };

        if ($dbConfig->last_fetched_at === null) {
            return true;
        }

        $daysSinceLastFetch = $dbConfig->last_fetched_at->diffInDays(now());

        return $daysSinceLastFetch >= $intervalDays;
    }

    /**
     * Check if should fetch based on default frequency only.
     */
    private function shouldFetchFromDefault(string $categoryType): bool
    {
        $default = config('news-workflow.fetch_frequencies.default', 'daily');

        // Default is daily, so always fetch
        return $default === 'daily';
    }

    /**
     * Get the default frequency type for a category from config.
     */
    private function getDefaultFrequencyType(string $category, string $categoryType): string
    {
        $configKey = $categoryType === NewsFetchFrequency::CATEGORY_TYPE_NEWS
            ? 'news-workflow.fetch_frequencies.news_categories'
            : 'news-workflow.fetch_frequencies.business_categories';

        $frequencyConfig = config($configKey, []);
        $frequency = $frequencyConfig[$category] ?? config('news-workflow.fetch_frequencies.default', 'daily');

        [$frequencyType] = $this->parseFrequencyConfig($frequency);

        return $frequencyType;
    }

    /**
     * Get the default custom days for a category from config.
     */
    private function getDefaultCustomDays(string $category, string $categoryType): ?int
    {
        $configKey = $categoryType === NewsFetchFrequency::CATEGORY_TYPE_NEWS
            ? 'news-workflow.fetch_frequencies.news_categories'
            : 'news-workflow.fetch_frequencies.business_categories';

        $frequencyConfig = config($configKey, []);
        $frequency = $frequencyConfig[$category] ?? config('news-workflow.fetch_frequencies.default', 'daily');

        [, $customDays] = $this->parseFrequencyConfig($frequency);

        return $customDays;
    }

    /**
     * Parse frequency configuration value.
     *
     * @param  string|array<int, mixed>  $frequency
     * @return array{0: string, 1: int|null}
     */
    private function parseFrequencyConfig(string|array $frequency): array
    {
        if (is_array($frequency)) {
            // Format: ['custom_days', 3]
            return [$frequency[0], $frequency[1] ?? null];
        }

        // Format: 'daily', 'weekly', 'monthly'
        return [$frequency, null];
    }

    /**
     * Sync a single category frequency to database.
     *
     * @param  string|array<int, mixed>  $frequency
     */
    private function syncCategoryFrequency(string $category, string $categoryType, string|array $frequency): void
    {
        [$frequencyType, $customDays] = $this->parseFrequencyConfig($frequency);

        NewsFetchFrequency::query()->updateOrCreate(
            ['category' => $category, 'category_type' => $categoryType],
            [
                'frequency_type' => $frequencyType,
                'custom_interval_days' => $customDays,
                'is_enabled' => true,
            ]
        );
    }
}
