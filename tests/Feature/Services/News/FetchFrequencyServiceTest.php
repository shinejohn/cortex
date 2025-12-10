<?php

declare(strict_types=1);

use App\Models\Business;
use App\Models\NewsFetchFrequency;
use App\Services\News\FetchFrequencyService;
use Illuminate\Support\Facades\Config;

beforeEach(function () {
    $this->service = new FetchFrequencyService;
});

it('returns all categories when all are daily and never fetched', function () {
    // Ensure all categories are configured as daily
    Config::set('news-workflow.fetch_frequencies.default', 'daily');
    Config::set('news-workflow.fetch_frequencies.news_categories', []);

    $categories = $this->service->getCategoriesForToday();

    // Should return all configured categories
    $allCategories = config('news-workflow.business_discovery.categories', []);
    expect($categories->count())->toBe(count($allCategories));
});

it('excludes categories fetched within their interval', function () {
    // Create a daily category that was just fetched
    NewsFetchFrequency::factory()->create([
        'category' => 'museum',
        'category_type' => NewsFetchFrequency::CATEGORY_TYPE_NEWS,
        'frequency_type' => NewsFetchFrequency::FREQUENCY_DAILY,
        'last_fetched_at' => now(),
        'is_enabled' => true,
    ]);

    $shouldFetch = $this->service->shouldFetchCategory('museum', NewsFetchFrequency::CATEGORY_TYPE_NEWS);

    expect($shouldFetch)->toBeFalse();
});

it('includes categories past their fetch interval', function () {
    // Create a daily category that was fetched 2 days ago
    NewsFetchFrequency::factory()->create([
        'category' => 'museum',
        'category_type' => NewsFetchFrequency::CATEGORY_TYPE_NEWS,
        'frequency_type' => NewsFetchFrequency::FREQUENCY_DAILY,
        'last_fetched_at' => now()->subDays(2),
        'is_enabled' => true,
    ]);

    $shouldFetch = $this->service->shouldFetchCategory('museum', NewsFetchFrequency::CATEGORY_TYPE_NEWS);

    expect($shouldFetch)->toBeTrue();
});

it('respects weekly frequency interval', function () {
    // Create a weekly category that was fetched 3 days ago (should NOT fetch)
    NewsFetchFrequency::factory()->create([
        'category' => 'library',
        'category_type' => NewsFetchFrequency::CATEGORY_TYPE_NEWS,
        'frequency_type' => NewsFetchFrequency::FREQUENCY_WEEKLY,
        'last_fetched_at' => now()->subDays(3),
        'is_enabled' => true,
    ]);

    $shouldFetch = $this->service->shouldFetchCategory('library', NewsFetchFrequency::CATEGORY_TYPE_NEWS);

    expect($shouldFetch)->toBeFalse();

    // Update to 8 days ago (should fetch)
    NewsFetchFrequency::query()
        ->where('category', 'library')
        ->update(['last_fetched_at' => now()->subDays(8)]);

    $shouldFetchNow = $this->service->shouldFetchCategory('library', NewsFetchFrequency::CATEGORY_TYPE_NEWS);

    expect($shouldFetchNow)->toBeTrue();
});

it('respects custom days frequency interval', function () {
    // Create a custom 5-day category that was fetched 3 days ago (should NOT fetch)
    NewsFetchFrequency::factory()->create([
        'category' => 'stadium',
        'category_type' => NewsFetchFrequency::CATEGORY_TYPE_NEWS,
        'frequency_type' => NewsFetchFrequency::FREQUENCY_CUSTOM_DAYS,
        'custom_interval_days' => 5,
        'last_fetched_at' => now()->subDays(3),
        'is_enabled' => true,
    ]);

    $shouldFetch = $this->service->shouldFetchCategory('stadium', NewsFetchFrequency::CATEGORY_TYPE_NEWS);

    expect($shouldFetch)->toBeFalse();

    // Update to 6 days ago (should fetch)
    NewsFetchFrequency::query()
        ->where('category', 'stadium')
        ->update(['last_fetched_at' => now()->subDays(6)]);

    $shouldFetchNow = $this->service->shouldFetchCategory('stadium', NewsFetchFrequency::CATEGORY_TYPE_NEWS);

    expect($shouldFetchNow)->toBeTrue();
});

it('respects database overrides over config defaults', function () {
    // Config says daily, but DB says disabled
    Config::set('news-workflow.fetch_frequencies.news_categories.restaurant', 'daily');

    NewsFetchFrequency::factory()->create([
        'category' => 'restaurant',
        'category_type' => NewsFetchFrequency::CATEGORY_TYPE_NEWS,
        'frequency_type' => NewsFetchFrequency::FREQUENCY_DAILY,
        'is_enabled' => false, // Disabled in DB
    ]);

    $shouldFetch = $this->service->shouldFetchCategory('restaurant', NewsFetchFrequency::CATEGORY_TYPE_NEWS);

    expect($shouldFetch)->toBeFalse();
});

it('marks categories as fetched correctly', function () {
    $this->service->markCategoryFetched('bar', NewsFetchFrequency::CATEGORY_TYPE_NEWS);

    $frequency = NewsFetchFrequency::query()
        ->where('category', 'bar')
        ->where('category_type', NewsFetchFrequency::CATEGORY_TYPE_NEWS)
        ->first();

    expect($frequency)->not->toBeNull();
    expect($frequency->last_fetched_at)->not->toBeNull();
    expect($frequency->last_fetched_at->isToday())->toBeTrue();
});

it('updates existing frequency when marking as fetched', function () {
    // Create existing frequency
    $existing = NewsFetchFrequency::factory()->create([
        'category' => 'cafe',
        'category_type' => NewsFetchFrequency::CATEGORY_TYPE_NEWS,
        'frequency_type' => NewsFetchFrequency::FREQUENCY_WEEKLY,
        'last_fetched_at' => now()->subDays(10),
    ]);

    $this->service->markCategoryFetched('cafe', NewsFetchFrequency::CATEGORY_TYPE_NEWS);

    $frequency = NewsFetchFrequency::find($existing->id);

    expect($frequency->last_fetched_at->isToday())->toBeTrue();
});

it('handles disabled categories correctly', function () {
    NewsFetchFrequency::factory()->create([
        'category' => 'zoo',
        'category_type' => NewsFetchFrequency::CATEGORY_TYPE_NEWS,
        'frequency_type' => NewsFetchFrequency::FREQUENCY_DAILY,
        'last_fetched_at' => null, // Never fetched
        'is_enabled' => false,
    ]);

    $shouldFetch = $this->service->shouldFetchCategory('zoo', NewsFetchFrequency::CATEGORY_TYPE_NEWS);

    expect($shouldFetch)->toBeFalse();
});

it('filters businesses by category frequencies', function () {
    // Create businesses with different categories
    $restaurant = Business::factory()->create(['categories' => ['restaurant']]);
    $museum = Business::factory()->create(['categories' => ['museum']]);
    $bar = Business::factory()->create(['categories' => ['bar']]);

    // Mark restaurant and bar as recently fetched (within daily interval)
    NewsFetchFrequency::factory()->create([
        'category' => 'restaurant',
        'category_type' => NewsFetchFrequency::CATEGORY_TYPE_BUSINESS,
        'frequency_type' => NewsFetchFrequency::FREQUENCY_DAILY,
        'last_fetched_at' => now(),
        'is_enabled' => true,
    ]);

    NewsFetchFrequency::factory()->create([
        'category' => 'bar',
        'category_type' => NewsFetchFrequency::CATEGORY_TYPE_BUSINESS,
        'frequency_type' => NewsFetchFrequency::FREQUENCY_DAILY,
        'last_fetched_at' => now(),
        'is_enabled' => true,
    ]);

    // Museum has no frequency record, so it should be included (never fetched)
    $businesses = collect([$restaurant, $museum, $bar]);
    $filtered = $this->service->filterBusinessesByFrequency($businesses);

    // Only museum should be included (restaurant and bar were just fetched)
    expect($filtered->count())->toBe(1);
    expect($filtered->first()->id)->toBe($museum->id);
});

it('syncs default frequencies from config', function () {
    // Clear any existing frequencies
    NewsFetchFrequency::query()->delete();

    $synced = $this->service->syncDefaultFrequencies();

    expect($synced)->toBeGreaterThan(0);

    // Check that some frequencies were created
    $count = NewsFetchFrequency::query()->count();
    expect($count)->toBeGreaterThan(0);

    // Check a specific category was synced correctly
    $museum = NewsFetchFrequency::query()
        ->where('category', 'museum')
        ->where('category_type', NewsFetchFrequency::CATEGORY_TYPE_NEWS)
        ->first();

    expect($museum)->not->toBeNull();
    expect($museum->frequency_type)->toBe(NewsFetchFrequency::FREQUENCY_WEEKLY);
});

it('returns category status correctly', function () {
    // Create some frequency records
    NewsFetchFrequency::factory()->create([
        'category' => 'restaurant',
        'category_type' => NewsFetchFrequency::CATEGORY_TYPE_NEWS,
        'frequency_type' => NewsFetchFrequency::FREQUENCY_DAILY,
        'last_fetched_at' => now()->subDays(2),
        'is_enabled' => true,
    ]);

    $status = $this->service->getCategoryStatus();

    expect($status->count())->toBeGreaterThan(0);

    // Find restaurant in status
    $restaurantStatus = $status->firstWhere('category', 'restaurant');

    if ($restaurantStatus) {
        expect($restaurantStatus['should_fetch'])->toBeTrue();
        expect($restaurantStatus['frequency'])->toBe(NewsFetchFrequency::FREQUENCY_DAILY);
    }
});

it('includes never-fetched categories in getCategoriesForToday', function () {
    // No frequencies in database, all should be included
    NewsFetchFrequency::query()->delete();

    $categories = $this->service->getCategoriesForToday();
    $allCategories = config('news-workflow.business_discovery.categories', []);

    expect($categories->count())->toBe(count($allCategories));
});
