# TASK-04-P3: Add Text Search (New) with Pagination to GooglePlacesService

## Context

The current `GooglePlacesService` ONLY uses Nearby Search (New), which caps at 20 results with NO pagination. For dense categories like `restaurant` in any mid-size city with 300+ restaurants, we discover only 20 out of 300 — that's 93% never found. Text Search (New) supports pagination via `nextPageToken` with up to 60 results (3 pages × 20).

**Depends on:** TASK-03 (category list must distinguish dense vs sparse).

### Existing Code: GooglePlacesService.php — searchNearbyPlaces()

```php
private const NEARBY_SEARCH_URL = 'https://places.googleapis.com/v1/places:searchNearby';

private function searchNearbyPlaces(Region $region, string $category): array
{
    $radiusMeters = (int) config('news-workflow.business_discovery.radius_km', 25) * 1000;

    $fieldMask = implode(',', [
        'places.id', 'places.displayName', 'places.formattedAddress',
        'places.addressComponents', 'places.location', 'places.rating',
        'places.userRatingCount', 'places.websiteUri', 'places.nationalPhoneNumber',
        'places.types', 'places.primaryType', 'places.regularOpeningHours',
        'places.priceLevel', 'places.editorialSummary', 'places.photos',
    ]);

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
    return array_map(fn ($place) => $this->parseBusinessData($place), $data['places'] ?? []);
}
```

---

## Objective

Add a `searchTextPlaces()` method that uses Text Search (New) with automatic pagination (up to 3 pages / 60 results). Update `discoverBusinessesForCategory()` to choose the correct method based on category density.

---

## Files to Modify

### MODIFY: GooglePlacesService.php

**Add this constant near the top of the class (after NEARBY_SEARCH_URL):**

```php
private const TEXT_SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText';
```

**Add this new method to the class:**

```php
/**
 * Search for places using Text Search (New) with pagination.
 * Supports up to 60 results (3 pages × 20) via nextPageToken.
 *
 * Use for DENSE categories (restaurant, doctor, lawyer, etc.)
 * where Nearby Search's 20-result cap is insufficient.
 *
 * @return array<int, array<string, mixed>>
 */
public function searchTextPlaces(Region $region, string $category, ?string $fieldMask = null): array
{
    if (empty($this->apiKey)) {
        throw new Exception('Google Maps API key is not configured');
    }

    $radiusMeters = (int) config('news-workflow.business_discovery.radius_km', 25) * 1000;

    // Use provided field mask or build default
    if (!$fieldMask) {
        $fieldMask = $this->getDiscoveryFieldMask();
    }

    // Build the text query: "{category} in {city}, {state}"
    $textQuery = "{$category} in {$region->name}";
    if ($region->state) {
        $textQuery .= ", {$region->state}";
    }

    $allPlaces = [];
    $pageToken = null;
    $maxPages = 3; // Google allows up to 3 pages

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

        // Add page token for subsequent pages
        if ($pageToken) {
            $body['pageToken'] = $pageToken;
        }

        // Throttle between pages
        if ($page > 0) {
            usleep((int) config('news-workflow.business_discovery.throttle_ms', 100) * 1000);
        }

        $response = Http::timeout(30)
            ->withHeaders([
                'X-Goog-Api-Key' => $this->apiKey,
                'X-Goog-FieldMask' => $fieldMask . ',nextPageToken',
                'Content-Type' => 'application/json',
            ])
            ->post(self::TEXT_SEARCH_URL, $body);

        if (! $response->successful()) {
            Log::warning('Text Search API page failed', [
                'page' => $page,
                'status' => $response->status(),
                'body' => substr($response->body(), 0, 500),
            ]);
            break;
        }

        $data = $response->json();
        $places = $data['places'] ?? [];
        $allPlaces = array_merge($allPlaces, $places);

        Log::info('Text Search page completed', [
            'region' => $region->name,
            'category' => $category,
            'page' => $page + 1,
            'results_this_page' => count($places),
            'total_so_far' => count($allPlaces),
        ]);

        // Check for next page
        $pageToken = $data['nextPageToken'] ?? null;
        if (!$pageToken || count($places) < 20) {
            break; // No more pages
        }
    }

    return array_map(fn ($place) => $this->parseBusinessData($place), $allPlaces);
}

/**
 * Execute a free-text search query (for catch-all queries not in Table A).
 * Example: "accounting firms in Tampa, FL"
 *
 * @return array<int, array<string, mixed>>
 */
public function searchTextQuery(Region $region, string $query, ?string $fieldMask = null): array
{
    if (empty($this->apiKey)) {
        throw new Exception('Google Maps API key is not configured');
    }

    $radiusMeters = (int) config('news-workflow.business_discovery.radius_km', 25) * 1000;

    if (!$fieldMask) {
        $fieldMask = $this->getDiscoveryFieldMask();
    }

    $textQuery = "{$query} in {$region->name}";
    if ($region->state) {
        $textQuery .= ", {$region->state}";
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
 * Get the default discovery field mask (Essentials tier — $5/1K).
 * NOTE: This will be further optimized in TASK-05. For now, returns the current mask.
 */
private function getDiscoveryFieldMask(): string
{
    return implode(',', [
        'places.id',
        'places.displayName',
        'places.formattedAddress',
        'places.addressComponents',
        'places.location',
        'places.types',
        'places.primaryType',
        'places.websiteUri',
        'places.nationalPhoneNumber',
        // NOTE: rating and userRatingCount are Pro fields.
        // TASK-05 will remove them from discovery.
        'places.rating',
        'places.userRatingCount',
    ]);
}
```

**Modify the `discoverBusinessesForCategory()` method to route dense vs sparse:**

Find the existing method:
```php
public function discoverBusinessesForCategory(Region $region, string $category): array
{
    try {
        return $this->retryWithBackoff(function () use ($region, $category) {
            return $this->searchNearbyPlaces($region, $category);
        });
```

Replace with:
```php
public function discoverBusinessesForCategory(Region $region, string $category): array
{
    $denseCategories = config('news-workflow.business_discovery.dense_categories', []);
    $useTextSearch = in_array($category, $denseCategories);

    try {
        return $this->retryWithBackoff(function () use ($region, $category, $useTextSearch) {
            if ($useTextSearch) {
                return $this->searchTextPlaces($region, $category);
            }
            return $this->searchNearbyPlaces($region, $category);
        });
    } catch (Exception $e) {
        Log::error('Google Places API business discovery failed for category', [
            'region' => $region->name,
            'category' => $category,
            'method' => $useTextSearch ? 'text_search' : 'nearby_search',
            'error' => $e->getMessage(),
        ]);
        throw $e;
    }
}
```

---

## Implementation Steps

1. Add `TEXT_SEARCH_URL` constant.
2. Add `searchTextPlaces()`, `searchTextQuery()`, and `getDiscoveryFieldMask()` methods.
3. Modify `discoverBusinessesForCategory()` to route based on category density.
4. Clear config cache.

---

## Verification

```bash
php artisan config:clear

# Verify the routing logic (no API call needed)
php artisan tinker --execute="
    \$dense = config('news-workflow.business_discovery.dense_categories');
    echo 'restaurant is dense: ' . (in_array('restaurant', \$dense) ? 'YES' : 'NO') . PHP_EOL;
    echo 'cemetery is dense: ' . (in_array('cemetery', \$dense) ? 'YES' : 'NO') . PHP_EOL;
    echo 'Dense count: ' . count(\$dense) . PHP_EOL;
"

# Optional: test actual API call for one dense category (costs ~$0.005)
# php artisan tinker --execute="
#     \$gps = app(\App\Services\News\GooglePlacesService::class);
#     \$region = \App\Models\Region::first();
#     \$results = \$gps->searchTextPlaces(\$region, 'restaurant');
#     echo 'Text Search results: ' . count(\$results);
# "
```

**Expected:** `restaurant` is dense: YES, `cemetery` is dense: NO
