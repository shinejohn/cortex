<?php

declare(strict_types=1);

namespace App\Services\News;

use App\Models\Business;
use App\Models\Region;
use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SerpApiService
{
    private readonly string $apiKey;

    private readonly string $baseUrl;

    public function __construct()
    {
        $apiKey = config('news-workflow.apis.serpapi_key');
        if (empty($apiKey)) {
            throw new \RuntimeException(
                'SERP API key not configured. Please set SERPAPI_KEY in your .env file.'
            );
        }
        $this->apiKey = $apiKey;
        $this->baseUrl = 'https://serpapi.com/search';
    }

    /**
     * Discover businesses in a region using Google Local search
     *
     * @deprecated Use discoverBusinessesForCategory() for parallelized job processing
     */
    public function discoverBusinesses(Region $region, array $categories): array
    {
        $businesses = [];

        foreach ($categories as $category) {
            try {
                $results = $this->retryWithBackoff(function () use ($region, $category) {
                    return $this->searchLocalBusinesses($region, $category);
                });

                $businesses = array_merge($businesses, $results);
            } catch (Exception $e) {
                Log::error('SERP API business discovery failed', [
                    'region' => $region->name,
                    'category' => $category,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $businesses;
    }

    /**
     * Discover businesses for a SINGLE category (used by parallelized jobs)
     *
     * @return array<int, array<string, mixed>>
     */
    public function discoverBusinessesForCategory(Region $region, string $category): array
    {
        try {
            return $this->retryWithBackoff(function () use ($region, $category) {
                return $this->searchLocalBusinesses($region, $category);
            });
        } catch (Exception $e) {
            Log::error('SERP API business discovery failed for category', [
                'region' => $region->name,
                'category' => $category,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Fetch news articles for a specific business
     */
    public function fetchNewsForBusiness(Business $business): array
    {
        try {
            return $this->retryWithBackoff(function () use ($business) {
                return $this->searchBusinessNews($business);
            });
        } catch (Exception $e) {
            Log::error('SERP API business news fetch failed', [
                'business' => $business->name,
                'error' => $e->getMessage(),
            ]);

            return [];
        }
    }

    /**
     * Fetch general category news for a region
     */
    public function fetchCategoryNews(Region $region, string $category): array
    {
        try {
            return $this->retryWithBackoff(function () use ($region, $category) {
                return $this->searchCategoryNews($region, $category);
            });
        } catch (Exception $e) {
            Log::error('SERP API category news fetch failed', [
                'region' => $region->name,
                'category' => $category,
                'error' => $e->getMessage(),
            ]);

            return [];
        }
    }

    /**
     * Geocode a location string to get latitude and longitude
     *
     * @param  string  $query  Location string (e.g., "Gainesville, Alachua County, FL")
     * @return array{latitude: float, longitude: float}|null
     */
    public function geocodeLocation(string $query): ?array
    {
        try {
            return $this->retryWithBackoff(function () use ($query) {
                return $this->searchGeocode($query);
            });
        } catch (Exception $e) {
            Log::error('SERP API geocoding failed', [
                'query' => $query,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Parse business data from SERP API response
     */
    public function parseBusinessData(array $result): array
    {
        return [
            'google_place_id' => $result['place_id'] ?? null,
            'name' => $result['title'] ?? $result['name'] ?? '',
            'description' => $result['description'] ?? null,
            'address' => $result['address'] ?? null,
            'latitude' => $result['gps_coordinates']['latitude'] ?? null,
            'longitude' => $result['gps_coordinates']['longitude'] ?? null,
            'rating' => $result['rating'] ?? null,
            'reviews_count' => $result['reviews'] ?? 0,
            'phone' => $result['phone'] ?? null,
            'website' => $result['website'] ?? null,
            'categories' => $this->extractCategories($result),
            'opening_hours' => $result['hours'] ?? null,
            'serp_metadata' => $result,
        ];
    }

    /**
     * Parse news article data from SERP API response
     */
    public function parseNewsData(array $result, ?Business $business = null): array
    {
        return [
            'title' => $result['title'] ?? '',
            'url' => $result['link'] ?? '',
            'content_snippet' => $result['snippet'] ?? $result['highlight']['snippet'] ?? null,
            'source_publisher' => $result['source']['name'] ?? $result['source'] ?? 'Unknown',
            'published_at' => $this->parseDate($result['date'] ?? null),
            'business_id' => $business?->id,
            'source_type' => $business ? 'business' : 'category',
            'source_name' => $business?->name ?? '',
            'metadata' => $result,
        ];
    }

    /**
     * Search for geocoding data via Google Maps
     *
     * @return array{latitude: float, longitude: float}|null
     */
    private function searchGeocode(string $query): ?array
    {
        $response = Http::timeout(30)->get($this->baseUrl, [
            'api_key' => $this->apiKey,
            'engine' => 'google_maps',
            'q' => $query,
            'type' => 'search',
            'hl' => 'en',
        ]);

        if (! $response->successful()) {
            throw new Exception("SERP API geocode request failed: {$response->status()}");
        }

        $data = $response->json();

        // Try to get coordinates from place_results first (single place match)
        if (isset($data['place_results']['gps_coordinates'])) {
            return [
                'latitude' => (float) $data['place_results']['gps_coordinates']['latitude'],
                'longitude' => (float) $data['place_results']['gps_coordinates']['longitude'],
            ];
        }

        // Fall back to first local result
        $localResults = $data['local_results'] ?? [];
        if (! empty($localResults) && isset($localResults[0]['gps_coordinates'])) {
            return [
                'latitude' => (float) $localResults[0]['gps_coordinates']['latitude'],
                'longitude' => (float) $localResults[0]['gps_coordinates']['longitude'],
            ];
        }

        // Try search_metadata location if available
        if (isset($data['search_metadata']['google_maps_url'])) {
            // Parse coordinates from the URL if possible
            if (preg_match('/@(-?\d+\.\d+),(-?\d+\.\d+)/', $data['search_metadata']['google_maps_url'], $matches)) {
                return [
                    'latitude' => (float) $matches[1],
                    'longitude' => (float) $matches[2],
                ];
            }
        }

        Log::warning('SERP API geocoding returned no coordinates', [
            'query' => $query,
            'response_keys' => array_keys($data),
        ]);

        return null;
    }

    /**
     * Parse date from SERP API response (handles Google News format)
     */
    private function parseDate(?string $dateString): ?\Carbon\Carbon
    {
        if (! $dateString) {
            return null;
        }

        try {
            // Google News format: "04/02/2025, 07:00 AM, +0000 UTC"
            // Remove the invalid timezone format and parse
            $cleaned = preg_replace('/, \+\d{4} UTC$/', '', $dateString);

            return \Carbon\Carbon::parse($cleaned);
        } catch (Exception $e) {
            Log::warning('Failed to parse date from SERP API', [
                'date_string' => $dateString,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Search for local businesses via Google Local Results
     */
    private function searchLocalBusinesses(Region $region, string $category): array
    {
        $response = Http::timeout(30)->get($this->baseUrl, [
            'api_key' => $this->apiKey,
            'engine' => 'google_maps',
            'q' => $category,
            'll' => "@{$region->latitude},{$region->longitude},15z",
            'type' => 'search',
            'hl' => 'en',
        ]);

        if (! $response->successful()) {
            throw new Exception("SERP API request failed: {$response->status()}");
        }

        $data = $response->json();

        return array_map(
            fn ($result) => $this->parseBusinessData($result),
            $data['local_results'] ?? []
        );
    }

    /**
     * Search for news about a specific business
     */
    private function searchBusinessNews(Business $business): array
    {
        $state = $business->state ?? '';
        // Use flexible query - quoted business name but unquoted location for better results
        $query = "\"{$business->name}\" {$business->city} {$state} news";
        $lookbackDays = config('news-workflow.news_collection.lookback_days', 7);

        $response = Http::timeout(30)->get($this->baseUrl, [
            'api_key' => $this->apiKey,
            'engine' => 'google_news',
            'q' => $query,
            'gl' => 'us',
            'hl' => 'en',
        ]);

        if (! $response->successful()) {
            throw new Exception("SERP API news request failed: {$response->status()}");
        }

        $data = $response->json();
        $newsResults = $data['news_results'] ?? [];

        // Filter by date
        $cutoffDate = now()->subDays($lookbackDays);

        return array_map(
            fn ($result) => $this->parseNewsData($result, $business),
            array_filter($newsResults, function ($result) use ($cutoffDate) {
                if (! isset($result['date'])) {
                    return true;
                }

                $publishDate = $this->parseDate($result['date']);

                // If we couldn't parse the date, include the article
                if (! $publishDate) {
                    return true;
                }

                return $publishDate->gte($cutoffDate);
            })
        );
    }

    /**
     * Search for general category news in a region
     */
    private function searchCategoryNews(Region $region, string $category): array
    {
        // Use news-friendly search terms if available, otherwise fall back to category label
        $categoryTerms = config("news-workflow.category_news_terms.{$category}");
        $searchTerms = $categoryTerms ?? str_replace('_', ' ', $category);

        // Simple query format: "[Region Name] [search terms]" works best for Google News
        // Avoid adding state abbreviation as it makes queries too restrictive
        $query = "{$region->name} {$searchTerms}";
        $lookbackDays = config('news-workflow.news_collection.lookback_days', 7);

        $response = Http::timeout(30)->get($this->baseUrl, [
            'api_key' => $this->apiKey,
            'engine' => 'google_news',
            'q' => $query,
            'gl' => 'us',
            'hl' => 'en',
        ]);

        if (! $response->successful()) {
            throw new Exception("SERP API category news request failed: {$response->status()}");
        }

        $data = $response->json();
        $newsResults = $data['news_results'] ?? [];

        $cutoffDate = now()->subDays($lookbackDays);

        return array_map(
            fn ($result) => $this->parseNewsData($result),
            array_filter($newsResults, function ($result) use ($cutoffDate) {
                if (! isset($result['date'])) {
                    return true;
                }

                $publishDate = $this->parseDate($result['date']);

                // If we couldn't parse the date, include the article
                if (! $publishDate) {
                    return true;
                }

                return $publishDate->gte($cutoffDate);
            })
        );
    }

    /**
     * Extract categories from business result
     */
    private function extractCategories(array $result): array
    {
        $categories = [];

        if (isset($result['type'])) {
            $categories[] = $result['type'];
        }

        if (isset($result['types']) && is_array($result['types'])) {
            $categories = array_merge($categories, $result['types']);
        }

        return array_unique(array_filter($categories));
    }

    /**
     * Get search radius from config
     */
    private function getSearchRadius(): string
    {
        $radiusKm = config('news-workflow.business_discovery.radius_km', 25);

        return "{$radiusKm}km";
    }

    /**
     * Retry logic with exponential backoff
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
                sleep($delay);

                Log::warning('SERP API request retry', [
                    'attempt' => $attempt,
                    'max_attempts' => $maxAttempts,
                    'delay' => $delay,
                ]);
            }
        }

        throw new Exception('Retry failed');
    }

    /**
     * Get state abbreviation from a region by traversing its hierarchy
     */
    private function getStateFromRegion(Region $region): string
    {
        $stateName = null;

        // For state-type regions, use the name directly
        if ($region->type === 'state') {
            $stateName = $region->name;
        } else {
            // Traverse ancestors to find state
            foreach ($region->ancestors() as $ancestor) {
                if ($ancestor->type === 'state') {
                    $stateName = $ancestor->name;
                    break;
                }
            }
        }

        // Convert to abbreviation for better search results
        return $stateName ? $this->getStateAbbreviation($stateName) : '';
    }

    /**
     * Convert state name to abbreviation
     */
    private function getStateAbbreviation(string $stateName): string
    {
        $states = [
            'Alabama' => 'AL', 'Alaska' => 'AK', 'Arizona' => 'AZ', 'Arkansas' => 'AR',
            'California' => 'CA', 'Colorado' => 'CO', 'Connecticut' => 'CT', 'Delaware' => 'DE',
            'Florida' => 'FL', 'Georgia' => 'GA', 'Hawaii' => 'HI', 'Idaho' => 'ID',
            'Illinois' => 'IL', 'Indiana' => 'IN', 'Iowa' => 'IA', 'Kansas' => 'KS',
            'Kentucky' => 'KY', 'Louisiana' => 'LA', 'Maine' => 'ME', 'Maryland' => 'MD',
            'Massachusetts' => 'MA', 'Michigan' => 'MI', 'Minnesota' => 'MN', 'Mississippi' => 'MS',
            'Missouri' => 'MO', 'Montana' => 'MT', 'Nebraska' => 'NE', 'Nevada' => 'NV',
            'New Hampshire' => 'NH', 'New Jersey' => 'NJ', 'New Mexico' => 'NM', 'New York' => 'NY',
            'North Carolina' => 'NC', 'North Dakota' => 'ND', 'Ohio' => 'OH', 'Oklahoma' => 'OK',
            'Oregon' => 'OR', 'Pennsylvania' => 'PA', 'Rhode Island' => 'RI', 'South Carolina' => 'SC',
            'South Dakota' => 'SD', 'Tennessee' => 'TN', 'Texas' => 'TX', 'Utah' => 'UT',
            'Vermont' => 'VT', 'Virginia' => 'VA', 'Washington' => 'WA', 'West Virginia' => 'WV',
            'Wisconsin' => 'WI', 'Wyoming' => 'WY', 'District of Columbia' => 'DC',
        ];

        return $states[$stateName] ?? $stateName;
    }
}
