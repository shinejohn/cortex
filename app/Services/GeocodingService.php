<?php

declare(strict_types=1);

namespace App\Services;

use App\Contracts\GeocodingServiceInterface;
use App\Models\Region;
use Exception;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

final class GeocodingService implements GeocodingServiceInterface
{
    private const GOOGLE_GEOCODE_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

    private const SERPAPI_LOCATIONS_URL = 'https://serpapi.com/locations.json';

    private const SERPAPI_SEARCH_URL = 'https://serpapi.com/search';

    private const CACHE_TTL = 60 * 60 * 24 * 30; // 30 days

    public function __construct(
        private readonly ?string $apiKey = null
    ) {}

    /**
     * Geocode an address to coordinates
     *
     * @return array{latitude: float, longitude: float, postal_code: ?string, google_place_id: ?string}|null
     */
    public function geocodeAddress(string $address): ?array
    {
        $cacheKey = 'geocode:'.md5($address);

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($address) {
            // 1. Try free SerpAPI Locations API first (no API key needed, best for cities/regions)
            $result = $this->geocodeWithSerpApiLocations($address);

            // 2. If Locations API fails, try Google Maps API (if configured)
            if ($result === null) {
                Log::info('GeocodingService: SerpAPI Locations failed, trying Google Maps API', [
                    'address' => $address,
                ]);
                $result = $this->geocodeWithGoogle($address);
            }

            // 3. If Google fails, try paid SerpAPI Google Maps engine as last resort
            if ($result === null) {
                Log::info('GeocodingService: Google API failed, trying SerpAPI Google Maps', [
                    'address' => $address,
                ]);
                $result = $this->geocodeWithSerpApiGoogleMaps($address);
            }

            return $result;
        });
    }

    /**
     * Geocode a venue by name and optional address
     *
     * @return array{latitude: float, longitude: float, postal_code: ?string, google_place_id: ?string}|null
     */
    public function geocodeVenue(string $venueName, ?string $address = null, ?string $regionName = null): ?array
    {
        // Build search query from available information
        $parts = array_filter([$venueName, $address, $regionName]);
        $searchQuery = implode(', ', $parts);

        if (empty($searchQuery)) {
            return null;
        }

        // First try with full query
        $result = $this->geocodeAddress($searchQuery);

        // If no result and we have address, try without venue name
        if ($result === null && ! empty($address)) {
            $fallbackQuery = implode(', ', array_filter([$address, $regionName]));
            $result = $this->geocodeAddress($fallbackQuery);
        }

        // If still no result, try just venue name with region
        if ($result === null && ! empty($regionName)) {
            $fallbackQuery = "{$venueName}, {$regionName}";
            $result = $this->geocodeAddress($fallbackQuery);
        }

        return $result;
    }

    /**
     * Clear cached geocoding results for an address
     */
    public function clearCache(string $address): bool
    {
        $cacheKey = 'geocode:'.md5($address);

        return Cache::forget($cacheKey);
    }

    /**
     * Geocode a region and update its coordinates
     */
    public function geocodeRegion(Region $region): bool
    {
        $query = $this->buildQueryForRegion($region);

        if (! $query) {
            Log::warning('GeocodingService: Cannot build query for region', [
                'region_id' => $region->id,
                'region_name' => $region->name,
                'region_type' => $region->type,
            ]);

            return false;
        }

        $result = $this->geocodeAddress($query);

        if (! $result) {
            Log::warning('GeocodingService: No coordinates for region', [
                'region_id' => $region->id,
                'region_name' => $region->name,
                'query' => $query,
            ]);

            return false;
        }

        $region->update([
            'latitude' => $result['latitude'],
            'longitude' => $result['longitude'],
        ]);

        Log::info('GeocodingService: Region geocoded successfully', [
            'region_id' => $region->id,
            'region_name' => $region->name,
            'latitude' => $result['latitude'],
            'longitude' => $result['longitude'],
        ]);

        return true;
    }

    /**
     * Geocode a location by city and state
     *
     * Note: County parameter is kept for backwards compatibility but not used
     * since SerpAPI Locations API format is "City,State,United States"
     *
     * @return array{latitude: float, longitude: float, postal_code: ?string, google_place_id: ?string}|null
     */
    public function geocodeLocation(string $city, ?string $county, string $state): ?array
    {
        // SerpAPI Locations format: "City,State,United States" (county not used)
        unset($county);
        $query = "{$city},{$state},United States";

        return $this->geocodeAddress($query);
    }

    /**
     * Geocode using Google Maps API
     *
     * @return array{latitude: float, longitude: float, postal_code: ?string, google_place_id: ?string, formatted_address: ?string}|null
     */
    private function geocodeWithGoogle(string $address): ?array
    {
        $apiKey = $this->apiKey ?? config('services.google.maps_api_key') ?? env('GOOGLE_MAPS_API_KEY');

        if (empty($apiKey)) {
            Log::info('GeocodingService: No Google Maps API key configured, skipping Google geocoding');

            return null;
        }

        try {
            $response = Http::timeout(10)
                ->get(self::GOOGLE_GEOCODE_API_URL, [
                    'address' => $address,
                    'key' => $apiKey,
                ]);

            if (! $response->successful()) {
                Log::warning('GeocodingService: Google API request failed', [
                    'status' => $response->status(),
                    'address' => $address,
                ]);

                return null;
            }

            $data = $response->json();

            if ($data['status'] !== 'OK' || empty($data['results'])) {
                Log::info('GeocodingService: Google API returned no results', [
                    'status' => $data['status'],
                    'address' => $address,
                ]);

                return null;
            }

            $result = $data['results'][0];
            $location = $result['geometry']['location'];

            // Extract postal code from address components
            $postalCode = null;
            foreach ($result['address_components'] ?? [] as $component) {
                if (in_array('postal_code', $component['types'])) {
                    $postalCode = $component['short_name'];
                    break;
                }
            }

            return [
                'latitude' => (float) $location['lat'],
                'longitude' => (float) $location['lng'],
                'postal_code' => $postalCode,
                'google_place_id' => $result['place_id'] ?? null,
                'formatted_address' => $result['formatted_address'] ?? null,
            ];
        } catch (Exception $e) {
            Log::error('GeocodingService: Google API exception', [
                'address' => $address,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Geocode using SerpAPI Locations API (FREE - no API key required)
     *
     * This API searches SerpApi's database of supported locations and returns GPS coordinates.
     * Best for cities, counties, states, and well-known locations.
     *
     * @see https://serpapi.com/locations-api
     *
     * @return array{latitude: float, longitude: float, postal_code: ?string, google_place_id: ?string, formatted_address: ?string}|null
     */
    private function geocodeWithSerpApiLocations(string $address): ?array
    {
        try {
            $response = Http::timeout(10)->get(self::SERPAPI_LOCATIONS_URL, [
                'q' => $address,
                'limit' => 5,
            ]);

            if (! $response->successful()) {
                Log::warning('GeocodingService: SerpAPI Locations request failed', [
                    'status' => $response->status(),
                    'address' => $address,
                ]);

                return null;
            }

            $locations = $response->json();

            if (empty($locations) || ! is_array($locations)) {
                Log::info('GeocodingService: SerpAPI Locations returned no results', [
                    'address' => $address,
                ]);

                return null;
            }

            // Find the best match - prefer City type, then look for US locations
            $bestMatch = $this->findBestLocationMatch($locations, $address);

            if ($bestMatch && isset($bestMatch['gps']) && is_array($bestMatch['gps']) && count($bestMatch['gps']) >= 2) {
                // SerpAPI returns gps as [longitude, latitude]
                return [
                    'latitude' => (float) $bestMatch['gps'][1],
                    'longitude' => (float) $bestMatch['gps'][0],
                    'postal_code' => null,
                    'google_place_id' => null,
                    'formatted_address' => $bestMatch['canonical_name'] ?? $bestMatch['name'] ?? null,
                ];
            }

            Log::info('GeocodingService: SerpAPI Locations found no matching coordinates', [
                'address' => $address,
                'locations_count' => count($locations),
            ]);

            return null;
        } catch (Exception $e) {
            Log::error('GeocodingService: SerpAPI Locations exception', [
                'address' => $address,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Find the best matching location from SerpAPI Locations results
     *
     * @param  array<int, array<string, mixed>>  $locations
     * @return array<string, mixed>|null
     */
    private function findBestLocationMatch(array $locations, string $address): ?array
    {
        // Normalize the search address for comparison
        $normalizedAddress = mb_strtolower($address);

        // Prioritize by target_type: City > County > DMA Region > State > others
        $typePriority = [
            'City' => 1,
            'County' => 2,
            'DMA Region' => 3,
            'State' => 4,
            'Neighborhood' => 5,
        ];

        $bestMatch = null;
        $bestScore = PHP_INT_MAX;

        foreach ($locations as $location) {
            // Must have GPS coordinates
            if (! isset($location['gps']) || ! is_array($location['gps']) || count($location['gps']) < 2) {
                continue;
            }

            // Prefer US locations
            $isUS = ($location['country_code'] ?? '') === 'US';

            // Get type priority (lower is better)
            $type = $location['target_type'] ?? 'Other';
            $typePriorityScore = $typePriority[$type] ?? 10;

            // Check if canonical name matches well
            $canonicalName = mb_strtolower($location['canonical_name'] ?? '');
            $name = mb_strtolower($location['name'] ?? '');

            // Simple scoring: US locations get priority, then by type
            $score = ($isUS ? 0 : 100) + $typePriorityScore;

            // Bonus for exact name match at start
            if (str_starts_with($canonicalName, $normalizedAddress) || str_starts_with($name, $normalizedAddress)) {
                $score -= 50;
            }

            if ($score < $bestScore) {
                $bestScore = $score;
                $bestMatch = $location;
            }
        }

        return $bestMatch;
    }

    /**
     * Geocode using SerpAPI Google Maps engine (requires API key)
     *
     * This is a fallback when both Google Maps API and free Locations API fail.
     *
     * @return array{latitude: float, longitude: float, postal_code: ?string, google_place_id: ?string, formatted_address: ?string}|null
     */
    private function geocodeWithSerpApiGoogleMaps(string $address): ?array
    {
        $apiKey = config('news-workflow.apis.serpapi_key') ?? config('services.serpapi.key') ?? env('SERPAPI_KEY');

        if (empty($apiKey)) {
            Log::info('GeocodingService: No SerpAPI key configured, skipping Google Maps fallback');

            return null;
        }

        try {
            $response = Http::timeout(30)->get(self::SERPAPI_SEARCH_URL, [
                'api_key' => $apiKey,
                'engine' => 'google_maps',
                'q' => $address,
                'type' => 'search',
                'hl' => 'en',
            ]);

            if (! $response->successful()) {
                Log::warning('GeocodingService: SerpAPI Google Maps request failed', [
                    'status' => $response->status(),
                    'address' => $address,
                ]);

                return null;
            }

            $data = $response->json();

            // Try to get coordinates from place_results first (single place match)
            if (isset($data['place_results']['gps_coordinates'])) {
                return [
                    'latitude' => (float) $data['place_results']['gps_coordinates']['latitude'],
                    'longitude' => (float) $data['place_results']['gps_coordinates']['longitude'],
                    'postal_code' => null,
                    'google_place_id' => $data['place_results']['place_id'] ?? null,
                    'formatted_address' => $data['place_results']['address'] ?? null,
                ];
            }

            // Fall back to first local result
            $localResults = $data['local_results'] ?? [];
            if (! empty($localResults) && isset($localResults[0]['gps_coordinates'])) {
                return [
                    'latitude' => (float) $localResults[0]['gps_coordinates']['latitude'],
                    'longitude' => (float) $localResults[0]['gps_coordinates']['longitude'],
                    'postal_code' => null,
                    'google_place_id' => $localResults[0]['place_id'] ?? null,
                    'formatted_address' => $localResults[0]['address'] ?? null,
                ];
            }

            // Try search_metadata location if available (parse from URL)
            if (isset($data['search_metadata']['google_maps_url'])) {
                if (preg_match('/@(-?\d+\.\d+),(-?\d+\.\d+)/', $data['search_metadata']['google_maps_url'], $matches)) {
                    return [
                        'latitude' => (float) $matches[1],
                        'longitude' => (float) $matches[2],
                        'postal_code' => null,
                        'google_place_id' => null,
                        'formatted_address' => null,
                    ];
                }
            }

            Log::info('GeocodingService: SerpAPI Google Maps returned no coordinates', [
                'address' => $address,
                'response_keys' => array_keys($data),
            ]);

            return null;
        } catch (Exception $e) {
            Log::error('GeocodingService: SerpAPI Google Maps exception', [
                'address' => $address,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Build a geocoding query string for a region
     *
     * For SerpAPI Locations API, the format should be: "City,State,United States"
     * Counties should be queried as "County Name,State,United States"
     */
    private function buildQueryForRegion(Region $region): ?string
    {
        // For state-level regions
        if ($region->type === 'state') {
            return "{$region->name},United States";
        }

        // For county-level, include state (format: "County Name,State,United States")
        if ($region->type === 'county') {
            $stateName = $region->parent?->name;

            return $stateName
                ? "{$region->name},{$stateName},United States"
                : "{$region->name},United States";
        }

        // For city/neighborhood, skip county and go directly to state
        // Format: "City,State,United States" (matching SerpAPI canonical format)
        $cityName = $region->name;
        $stateName = null;

        // Walk up the hierarchy to find the state (skip county)
        $parent = $region->parent;
        while ($parent) {
            if ($parent->type === 'state') {
                $stateName = $parent->name;
                break;
            }
            $parent = $parent->parent;
        }

        if ($stateName) {
            return "{$cityName},{$stateName},United States";
        }

        // Fallback if no state found
        return "{$cityName},United States";
    }
}
