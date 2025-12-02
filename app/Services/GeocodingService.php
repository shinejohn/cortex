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
    private const GEOCODE_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

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
        $apiKey = $this->apiKey ?? config('services.google.maps_api_key') ?? env('GOOGLE_MAPS_API_KEY');

        if (empty($apiKey)) {
            Log::warning('GeocodingService: No Google Maps API key configured');

            return null;
        }

        $cacheKey = 'geocode:'.md5($address);

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($address, $apiKey) {
            try {
                $response = Http::timeout(10)
                    ->get(self::GEOCODE_API_URL, [
                        'address' => $address,
                        'key' => $apiKey,
                    ]);

                if (! $response->successful()) {
                    Log::warning('GeocodingService: API request failed', [
                        'status' => $response->status(),
                        'address' => $address,
                    ]);

                    return null;
                }

                $data = $response->json();

                if ($data['status'] !== 'OK' || empty($data['results'])) {
                    Log::info('GeocodingService: No results found', [
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
                Log::error('GeocodingService: Exception during geocoding', [
                    'address' => $address,
                    'error' => $e->getMessage(),
                ]);

                return null;
            }
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
     * Geocode a location by city, county, and state
     *
     * @return array{latitude: float, longitude: float, postal_code: ?string, google_place_id: ?string}|null
     */
    public function geocodeLocation(string $city, string $county, string $state): ?array
    {
        $query = "{$city}, {$county} County, {$state}, USA";

        return $this->geocodeAddress($query);
    }

    /**
     * Build a geocoding query string for a region
     */
    private function buildQueryForRegion(Region $region): ?string
    {
        // For state-level regions, just use the state name
        if ($region->type === 'state') {
            return "{$region->name}, USA";
        }

        // For county-level, include state
        if ($region->type === 'county') {
            $stateName = $region->parent?->name;

            return $stateName
                ? "{$region->name}, {$stateName}, USA"
                : "{$region->name}, USA";
        }

        // For city/neighborhood, walk up the hierarchy
        $parts = [$region->name];
        $parent = $region->parent;

        while ($parent) {
            $parts[] = $parent->name;
            $parent = $parent->parent;
        }

        return implode(', ', $parts).', USA';
    }
}
