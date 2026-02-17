<?php

declare(strict_types=1);

namespace App\Services\News;

use App\Models\Region;
use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

final class GooglePlacesService
{
    private const NEARBY_SEARCH_URL = 'https://places.googleapis.com/v1/places:searchNearby';

    private const TEXT_SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText';

    private const PHOTO_URL = 'https://places.googleapis.com/v1';

    private readonly string $apiKey;

    public function __construct()
    {
        $this->apiKey = config('services.google.maps_api_key') ?? '';
    }

    /**
     * Essentials-only field mask (cost-optimized, no photo fetch during discovery).
     */
    public function getDiscoveryFieldMask(): string
    {
        return implode(',', [
            'places.id',
            'places.displayName',
            'places.formattedAddress',
            'places.addressComponents',
            'places.location',
            'places.rating',
            'places.userRatingCount',
            'places.nationalPhoneNumber',
            'places.websiteUri',
            'places.types',
            'places.primaryType',
            'places.regularOpeningHours',
            'places.priceLevel',
            'places.editorialSummary',
        ]);
    }

    /**
     * Discover businesses for a SINGLE category. Routes dense→Text Search, sparse→Nearby Search.
     *
     * @return array<int, array<string, mixed>>
     */
    public function discoverBusinessesForCategory(Region $region, string $category): array
    {
        $denseCategories = config('news-workflow.business_discovery.dense_categories', []);
        $useTextSearch = in_array($category, $denseCategories);

        try {
            return $this->retryWithBackoff(function () use ($region, $category, $useTextSearch) {
                return $useTextSearch
                    ? $this->searchTextPlaces($region, $category)
                    : $this->searchNearbyPlaces($region, $category);
            });
        } catch (Exception $e) {
            Log::error('Google Places API business discovery failed for category', [
                'region' => $region->name,
                'category' => $category,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Search for places using Text Search (New) with pagination. Up to 60 results (3 pages × 20).
     *
     * @return array<int, array<string, mixed>>
     */
    public function searchTextPlaces(Region $region, string $category, ?string $fieldMask = null): array
    {
        if (empty($this->apiKey)) {
            throw new Exception('Google Maps API key is not configured');
        }

        $fieldMask = $fieldMask ?? $this->getDiscoveryFieldMask();
        $radiusMeters = (int) config('news-workflow.business_discovery.radius_km', 25) * 1000;
        $throttleMs = (int) config('news-workflow.business_discovery.throttle_ms', 100);

        $textQuery = "{$category} in {$region->name}";
        $state = $region->metadata['state_code'] ?? $region->metadata['state'] ?? null;
        if ($state) {
            $textQuery .= ", {$state}";
        }

        $allPlaces = [];
        $pageToken = null;
        $maxPages = 3;

        for ($page = 0; $page < $maxPages; $page++) {
            $body = [
                'textQuery' => $textQuery,
                'locationBias' => [
                    'circle' => [
                        'center' => [
                            'latitude' => (float) $region->latitude,
                            'longitude' => (float) $region->longitude,
                        ],
                        'radius' => (float) $radiusMeters,
                    ],
                ],
                'maxResultCount' => 20,
            ];

            if ($pageToken) {
                $body['pageToken'] = $pageToken;
            }

            if ($page > 0) {
                usleep($throttleMs * 1000);
            }

            $response = Http::timeout(30)
                ->withHeaders([
                    'X-Goog-Api-Key' => $this->apiKey,
                    'X-Goog-FieldMask' => $fieldMask.',nextPageToken',
                    'Content-Type' => 'application/json',
                ])
                ->post(self::TEXT_SEARCH_URL, $body);

            if (! $response->successful()) {
                Log::warning('Text Search API page failed', [
                    'page' => $page,
                    'status' => $response->status(),
                    'body' => mb_substr($response->body(), 0, 500),
                ]);
                break;
            }

            $data = $response->json();
            $places = $data['places'] ?? [];
            $allPlaces = array_merge($allPlaces, $places);

            $pageToken = $data['nextPageToken'] ?? null;
            if (! $pageToken || count($places) < 20) {
                break;
            }
        }

        return array_map(fn ($place) => $this->parseBusinessData($place), $allPlaces);
    }

    /**
     * Execute a free-text search query (for catch-all queries not in Table A).
     *
     * @return array<int, array<string, mixed>>
     */
    public function searchTextQuery(Region $region, string $query, ?string $fieldMask = null): array
    {
        if (empty($this->apiKey)) {
            throw new Exception('Google Maps API key is not configured');
        }

        $fieldMask = $fieldMask ?? $this->getDiscoveryFieldMask();
        $radiusMeters = (int) config('news-workflow.business_discovery.radius_km', 25) * 1000;

        $textQuery = "{$query} in {$region->name}";
        $state = $region->metadata['state_code'] ?? $region->metadata['state'] ?? null;
        if ($state) {
            $textQuery .= ", {$state}";
        }

        $response = Http::timeout(30)
            ->withHeaders([
                'X-Goog-Api-Key' => $this->apiKey,
                'X-Goog-FieldMask' => $fieldMask,
                'Content-Type' => 'application/json',
            ])
            ->post(self::TEXT_SEARCH_URL, [
                'textQuery' => $textQuery,
                'locationBias' => [
                    'circle' => [
                        'center' => [
                            'latitude' => (float) $region->latitude,
                            'longitude' => (float) $region->longitude,
                        ],
                        'radius' => (float) $radiusMeters,
                    ],
                ],
                'maxResultCount' => 20,
            ]);

        if (! $response->successful()) {
            throw new Exception("Text Search API request failed: {$response->status()} - {$response->body()}");
        }

        $data = $response->json();

        return array_map(fn ($place) => $this->parseBusinessData($place), $data['places'] ?? []);
    }

    /**
     * Parse business data from Google Places API response
     *
     * @param  array<string, mixed>  $place
     * @return array<string, mixed>
     */
    public function parseBusinessData(array $place): array
    {
        $photoRefs = [];
        foreach (($place['photos'] ?? []) as $photo) {
            $name = $photo['name'] ?? null;
            if ($name) {
                $photoRefs[] = $name;
            }
        }

        return [
            'google_place_id' => $place['id'] ?? null,
            'name' => $place['displayName']['text'] ?? '',
            'description' => $place['editorialSummary']['text'] ?? null,
            'address' => $place['formattedAddress'] ?? null,
            'city' => $this->extractAddressComponent($place['addressComponents'] ?? [], 'locality'),
            'state' => $this->extractAddressComponent($place['addressComponents'] ?? [], 'administrative_area_level_1'),
            'postal_code' => $this->extractAddressComponent($place['addressComponents'] ?? [], 'postal_code'),
            'latitude' => $place['location']['latitude'] ?? null,
            'longitude' => $place['location']['longitude'] ?? null,
            'rating' => $place['rating'] ?? null,
            'reviews_count' => $place['userRatingCount'] ?? 0,
            'phone' => $place['nationalPhoneNumber'] ?? null,
            'website' => $place['websiteUri'] ?? null,
            'categories' => $place['types'] ?? [],
            'primary_type' => $place['primaryType'] ?? null,
            'opening_hours' => $place['regularOpeningHours']['weekdayDescriptions'] ?? null,
            'price_level' => $this->mapPriceLevel($place['priceLevel'] ?? null),
            'images' => $photoRefs,
            'serp_metadata' => $place,
            'serp_source' => 'google_places',
        ];
    }

    /**
     * Search for nearby places using Google Places API (New)
     *
     * @return array<int, array<string, mixed>>
     */
    private function searchNearbyPlaces(Region $region, string $category): array
    {
        if (empty($this->apiKey)) {
            throw new Exception('Google Maps API key is not configured');
        }

        $radiusMeters = (int) config('news-workflow.business_discovery.radius_km', 25) * 1000;
        $fieldMask = $this->getDiscoveryFieldMask();

        $response = Http::timeout(30)
            ->withHeaders([
                'X-Goog-Api-Key' => $this->apiKey,
                'X-Goog-FieldMask' => $fieldMask,
                'Content-Type' => 'application/json',
            ])
            ->post(self::NEARBY_SEARCH_URL, [
                'locationRestriction' => [
                    'circle' => [
                        'center' => [
                            'latitude' => (float) $region->latitude,
                            'longitude' => (float) $region->longitude,
                        ],
                        'radius' => (float) $radiusMeters,
                    ],
                ],
                'includedTypes' => [$category],
                'maxResultCount' => 20,
            ]);

        if (! $response->successful()) {
            throw new Exception("Google Places API request failed: {$response->status()} - {$response->body()}");
        }

        $data = $response->json();

        return array_map(
            fn ($place) => $this->parseBusinessData($place),
            $data['places'] ?? []
        );
    }

    /**
     * Fetch and store photos for a place
     *
     * @param  array<int, array<string, mixed>>  $photos
     * @return array<int, array<string, mixed>>
     */
    private function fetchAndStorePhotos(array $photos, string $placeId): array
    {
        if (! config('news-workflow.google_places.photo_storage.enabled', true)) {
            return [];
        }

        if (empty($photos) || empty($placeId)) {
            return [];
        }

        $maxPhotos = (int) config('news-workflow.google_places.max_photos_per_business', 3);
        $maxWidth = (int) config('news-workflow.google_places.photo_max_width', 800);
        $disk = config('news-workflow.google_places.photo_storage.disk', 'public');
        $basePath = config('news-workflow.google_places.photo_storage.path', 'business-photos');

        $storedPhotos = [];
        $photosToProcess = array_slice($photos, 0, $maxPhotos);

        foreach ($photosToProcess as $index => $photo) {
            try {
                $photoName = $photo['name'] ?? null;
                if (! $photoName) {
                    continue;
                }

                // Fetch the photo
                $photoUrl = self::PHOTO_URL."/{$photoName}/media?maxWidthPx={$maxWidth}&key={$this->apiKey}";
                $response = Http::timeout(30)->get($photoUrl);

                if (! $response->successful()) {
                    Log::warning('Failed to fetch Google Places photo', [
                        'place_id' => $placeId,
                        'photo_name' => $photoName,
                        'status' => $response->status(),
                    ]);

                    continue;
                }

                $imageContent = $response->body();
                if (empty($imageContent)) {
                    continue;
                }

                // Store the photo
                $year = date('Y');
                $month = date('m');
                $filename = "{$placeId}-{$index}.jpg";
                $storagePath = "{$basePath}/{$year}/{$month}/{$filename}";

                $stored = Storage::disk($disk)->put($storagePath, $imageContent);
                if (! $stored) {
                    Log::warning('Failed to store Google Places photo', [
                        'place_id' => $placeId,
                        'path' => $storagePath,
                    ]);

                    continue;
                }

                // Generate CDN proxy URL for serving S3 files through our app
                $publicUrl = '/img-cdn/'.$storagePath;

                $storedPhotos[] = [
                    'photo_id' => $photoName,
                    'storage_path' => $storagePath,
                    'storage_disk' => $disk,
                    'public_url' => $publicUrl,
                    'width' => $photo['widthPx'] ?? $maxWidth,
                    'height' => $photo['heightPx'] ?? null,
                    'attributions' => $photo['authorAttributions'] ?? [],
                ];

                Log::debug('Stored Google Places photo', [
                    'place_id' => $placeId,
                    'path' => $storagePath,
                ]);
            } catch (Exception $e) {
                Log::warning('Error processing Google Places photo', [
                    'place_id' => $placeId,
                    'index' => $index,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $storedPhotos;
    }

    /**
     * Extract a specific address component by type
     *
     * @param  array<int, array<string, mixed>>  $addressComponents
     */
    private function extractAddressComponent(array $addressComponents, string $type): ?string
    {
        foreach ($addressComponents as $component) {
            $types = $component['types'] ?? [];
            if (in_array($type, $types, true)) {
                return $component['shortText'] ?? $component['longText'] ?? null;
            }
        }

        return null;
    }

    /**
     * Map Google Places price level enum to symbol format
     */
    private function mapPriceLevel(?string $priceLevel): ?string
    {
        return match ($priceLevel) {
            'PRICE_LEVEL_INEXPENSIVE' => '$',
            'PRICE_LEVEL_MODERATE' => '$$',
            'PRICE_LEVEL_EXPENSIVE' => '$$$',
            'PRICE_LEVEL_VERY_EXPENSIVE' => '$$$$',
            default => null,
        };
    }

    /**
     * Retry logic with exponential backoff
     *
     * @template T
     *
     * @param  callable(): T  $callback
     * @return T
     */
    private function retryWithBackoff(callable $callback, int $maxAttempts = 3): mixed
    {
        $attempt = 0;

        while ($attempt < $maxAttempts) {
            try {
                return $callback();
            } catch (Exception $e) {
                $attempt++;

                if ($attempt >= $maxAttempts) {
                    throw $e;
                }

                $delay = pow(2, $attempt) * config('news-workflow.error_handling.retry_delay_seconds', 5);
                sleep((int) $delay);

                Log::warning('Google Places API request retry', [
                    'attempt' => $attempt,
                    'max_attempts' => $maxAttempts,
                    'delay' => $delay,
                ]);
            }
        }

        throw new Exception('Retry failed');
    }
}
