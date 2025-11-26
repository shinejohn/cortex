<?php

declare(strict_types=1);

namespace App\Services\News;

use App\Models\Business;
use App\Models\Region;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

final class BusinessDiscoveryService
{
    public function __construct(
        private readonly SerpApiService $serpApi
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
            // Fetch businesses from SERP API
            $businessesData = $this->serpApi->discoverBusinesses($region, $categories);

            Log::info('SERP API returned businesses', [
                'region' => $region->name,
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
     * Create or update a business from SERP data
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

        if ($business) {
            // Update existing business
            $business->update([
                'name' => $data['name'],
                'description' => $data['description'],
                'address' => $data['address'],
                'latitude' => $data['latitude'],
                'longitude' => $data['longitude'],
                'rating' => $data['rating'],
                'reviews_count' => $data['reviews_count'],
                'phone' => $data['phone'],
                'website' => $data['website'],
                'categories' => $data['categories'],
                'opening_hours' => $data['opening_hours'],
                'serp_metadata' => $data['serp_metadata'],
            ]);

            Log::info('Updated existing business', [
                'business_id' => $business->id,
                'name' => $business->name,
            ]);
        } else {
            // Create new business
            $business = Business::create([
                'google_place_id' => $googlePlaceId,
                'name' => $data['name'],
                'description' => $data['description'],
                'address' => $data['address'],
                'latitude' => $data['latitude'],
                'longitude' => $data['longitude'],
                'rating' => $data['rating'],
                'reviews_count' => $data['reviews_count'],
                'phone' => $data['phone'],
                'website' => $data['website'],
                'categories' => $data['categories'],
                'opening_hours' => $data['opening_hours'],
                'serp_metadata' => $data['serp_metadata'],
            ]);

            Log::info('Created new business', [
                'business_id' => $business->id,
                'name' => $business->name,
            ]);
        }

        return $business;
    }

    /**
     * Link business to region (many-to-many)
     */
    public function assignToRegion(Business $business, Region $region): void
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
    }
}
