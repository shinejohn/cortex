<?php

declare(strict_types=1);

namespace App\Services\News;

use App\Jobs\Rollout\ProcessWebsiteScanJob;
use App\Models\Business;
use App\Models\Region;
use App\Models\Rollout\CommunityRollout;
use App\Services\MediaLibraryService;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

final class BusinessDiscoveryService
{
    public function __construct(
        private readonly GooglePlacesService $googlePlaces,
        private readonly MediaLibraryService $mediaLibrary,
    ) {}

    /**
     * Discover and store businesses for a region (Phase 1)
     */
    public function discoverBusinesses(Region $region): int
    {
        if (! config('news-workflow.business_discovery.enabled', true)) {
            Log::info('Business discovery is disabled', ['region' => $region->name]);

            return 0;
        }

        $categories = config('news-workflow.business_discovery.categories', []);
        $businessesCount = 0;

        Log::info('Starting business discovery', [
            'region' => $region->name,
            'categories' => $categories,
        ]);

        try {
            // Fetch businesses for each category from Google Places API
            foreach ($categories as $category) {
                try {
                    $businessesData = $this->googlePlaces->discoverBusinessesForCategory($region, $category);

                    Log::info('Google Places API returned businesses', [
                        'region' => $region->name,
                        'category' => $category,
                        'count' => count($businessesData),
                    ]);

                    // Store each business and link to region
                    foreach ($businessesData as $businessData) {
                        try {
                            $business = $this->upsertBusiness($businessData, $region);
                            $this->assignToRegion($business, $region);
                            $businessesCount++;
                        } catch (Exception $e) {
                            Log::warning('Failed to store business', [
                                'business_name' => $businessData['name'] ?? 'Unknown',
                                'region' => $region->name,
                                'error' => $e->getMessage(),
                            ]);
                        }
                    }
                } catch (Exception $e) {
                    Log::warning('Failed to fetch businesses for category', [
                        'category' => $category,
                        'region' => $region->name,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            Log::info('Business discovery completed', [
                'region' => $region->name,
                'businesses_stored' => $businessesCount,
            ]);

            return $businessesCount;
        } catch (Exception $e) {
            Log::error('Business discovery failed for region', [
                'region' => $region->name,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Alias for discoverBusinesses (backwards compatibility)
     */
    public function discoverForRegion(Region $region): int
    {
        return $this->discoverBusinesses($region);
    }

    /**
     * Create or update a business from Google Places data
     *
     * @param  array<string, mixed>  $data
     */
    public function upsertBusiness(array $data, Region $region): Business
    {
        // Use google_place_id as unique identifier
        $googlePlaceId = $data['google_place_id'];

        if (! $googlePlaceId) {
            throw new Exception('Business data missing google_place_id');
        }

        // Find existing business by google_place_id
        $business = Business::where('google_place_id', $googlePlaceId)->first();

        $communityId = $region->community_id ?? $region->community?->id;

        $businessFields = [
            'community_id' => $communityId,
            'name' => $data['name'],
            'description' => $data['description'],
            'address' => $data['address'],
            'city' => $data['city'] ?? null,
            'state' => $data['state'] ?? null,
            'postal_code' => $data['postal_code'] ?? null,
            'latitude' => $data['latitude'],
            'longitude' => $data['longitude'],
            'rating' => $data['rating'],
            'reviews_count' => $data['reviews_count'],
            'phone' => $data['phone'],
            'website' => $data['website'],
            'categories' => $data['categories'],
            'primary_type' => $data['primary_type'] ?? null,
            'opening_hours' => $data['opening_hours'],
            'price_level' => $data['price_level'] ?? null,
            'images' => $data['images'] ?? [],
            'serp_metadata' => $data['serp_metadata'],
            'serp_source' => $data['serp_source'] ?? 'google_places',
            'serp_last_synced_at' => now(),
        ];

        if ($business) {
            // Update existing business
            $business->update($businessFields);

            Log::info('Updated existing business', [
                'business_id' => $business->id,
                'name' => $business->name,
            ]);
        } else {
            // Create new business
            $business = Business::create([
                'google_place_id' => $googlePlaceId,
                ...$businessFields,
            ]);

            Log::info('Created new business', [
                'business_id' => $business->id,
                'name' => $business->name,
            ]);
        }

        // Register Google Places photos into central media library
        $photos = $data['images'] ?? [];
        if (! empty($photos)) {
            $this->mediaLibrary->registerGooglePlacesPhotos($photos, $business, $region->id);
        }

        return $business;
    }

    /**
     * Link business to region (many-to-many). Optionally pass CommunityRollout for rollout metrics.
     */
    public function assignToRegion(Business $business, Region $region, ?CommunityRollout $communityRollout = null): void
    {
        // Check if relationship already exists
        $exists = DB::table('business_region')
            ->where('business_id', $business->id)
            ->where('region_id', $region->id)
            ->exists();

        if (! $exists) {
            DB::table('business_region')->insert([
                'business_id' => $business->id,
                'region_id' => $region->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            Log::debug('Assigned business to region', [
                'business_id' => $business->id,
                'business_name' => $business->name,
                'region_id' => $region->id,
                'region_name' => $region->name,
            ]);
        }

        $this->evaluateAndSetupNewsSource($business, $region, $communityRollout);
    }

    /**
     * Evaluate if business should be a news source, setup collection, and optionally dispatch website scan.
     */
    public function evaluateAndSetupNewsSource(Business $business, Region $region, ?CommunityRollout $communityRollout = null): void
    {
        // 1. Must have a website
        if (empty($business->website)) {
            return;
        }

        // Rollout path: dispatch website scan for any business with website (discovers RSS/sitemap)
        if ($communityRollout) {
            ProcessWebsiteScanJob::dispatch($business, $communityRollout)->onQueue('rollout');

            return;
        }

        // 2. Check types/categories for news potential (non-rollout path)
        // e.g., 'city_hall', 'police', 'school', 'newspaper', 'community_center'
        $newsyTypes = ['government', 'school', 'university', 'museum', 'library', 'police', 'fire_station', 'local_government_office', 'newspaper', 'news_media'];

        $isNewsy = false;
        foreach ($business->categories ?? [] as $cat) {
            if (str_contains(mb_strtolower($cat), 'news') || in_array(mb_strtolower($cat), $newsyTypes)) {
                $isNewsy = true;
                break;
            }
        }

        if (in_array($business->primary_type, $newsyTypes)) {
            $isNewsy = true;
        }

        if (! $isNewsy) {
            return;
        }

        // 3. Create News Source
        $source = \App\Models\NewsSource::firstOrCreate(
            ['business_id' => $business->id],
            [
                'name' => $business->name,
                'community_id' => $region->community_id, // Assuming region tracks community
                'region_id' => $region->id,
                'source_type' => 'organization_site',
                'description' => $business->description,
                'website_url' => $business->website,
                'is_active' => true,
                'priority' => 70,
                'customer_status' => 'prospect',
            ]
        );

        // 4. Create Collection Method (Web Scrape)
        if ($source->wasRecentlyCreated || ! $source->collectionMethods()->exists()) {

            // Determine Playwright requirement (rudimentary check or config)
            // By default, assume simple scrape, but use playwright if configured
            $usePlaywright = true; // Use robust scraper for organizational sites

            $method = $source->collectionMethods()->create([
                'method_type' => 'scrape',
                'name' => 'Website Scraper',
                'endpoint_url' => $business->website, // Or try to find /news URL via AI later
                'poll_interval_minutes' => 1440, // Daily check for orgs
                'is_enabled' => true,
                'requires_javascript' => $usePlaywright,
                'scrape_config' => [
                    'selectors' => [
                        'list' => 'article, .news-item, .post, .press-release', // Generic starting point
                        'title' => 'h1, h2, h3, .title',
                        'date' => '.date, time',
                    ],
                ],
            ]);

            Log::info('Auto-created News Source from Business', [
                'business_id' => $business->id,
                'source_id' => $source->id,
                'method' => 'scrape',
            ]);
        }
    }
}
