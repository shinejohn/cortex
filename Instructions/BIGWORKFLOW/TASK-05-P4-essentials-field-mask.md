# TASK-05-P4: Switch to Essentials-Only Field Mask (Two-Pass Strategy)

## Context

The current field mask in `GooglePlacesService::searchNearbyPlaces()` requests `places.editorialSummary`, `places.priceLevel`, `places.photos`, and `places.regularOpeningHours`. These push EVERY request to Enterprise+Atmosphere tier at **$25/1K**. Removing them drops to Essentials at **$5/1K** — an 80% cost reduction. At 9,000 communities, this is the difference between $90K and $360K.

**Depends on:** TASK-04 (Text Search must be in place so both methods use the same field mask).

### Current Cost Problem

| Field | SKU Tier | Cost |
|-------|----------|------|
| `places.editorialSummary` | Enterprise+Atmosphere | $25/1K |
| `places.priceLevel` | Enterprise+Atmosphere | $25/1K |
| `places.photos` | Enterprise+Atmosphere | $25/1K |
| `places.regularOpeningHours` | Enterprise | $20/1K |
| `places.rating` | Pro | $10/1K |

Google bills at the HIGHEST SKU triggered by ANY field. One Enterprise+Atmosphere field = entire request billed at $25/1K.

---

## Objective

Replace the discovery field mask with Essentials-only fields ($5/1K). Add a separate `enrichBusinessDetails()` method for Pro-tier data ($20/1K) that runs only on businesses with websites. Remove `fetchAndStorePhotos()` calls from `parseBusinessData()`.

---

## Files to Modify

### MODIFY: GooglePlacesService.php

#### Change 1: Update `getDiscoveryFieldMask()` (added in TASK-04)

**Find:**
```php
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

**Replace with:**
```php
/**
 * Essentials-only field mask for bulk discovery.
 * Cost: $5/1K requests (Essentials SKU).
 *
 * CRITICAL: Do NOT add places.photos, places.editorialSummary,
 * places.regularOpeningHours, places.priceLevel, places.rating,
 * or places.userRatingCount here. Those are Pro/Enterprise fields
 * that 4x-5x the cost of every request.
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
    ]);
}
```

#### Change 2: Update `searchNearbyPlaces()` to use the shared field mask

**Find the `$fieldMask = implode(',', [` block inside `searchNearbyPlaces()` and replace the entire field mask section with:**

```php
$fieldMask = $this->getDiscoveryFieldMask();
```

Remove the hardcoded `implode(',', [...])` with the 14 fields. The full updated method should use `$this->getDiscoveryFieldMask()` instead.

#### Change 3: Fix `parseBusinessData()` to handle missing Pro fields gracefully

**Find the existing `parseBusinessData()` and replace with:**

```php
/**
 * Parse business data from Google Places API response.
 * Handles both Essentials-only and Pro-enriched responses.
 *
 * @param  array<string, mixed>  $place
 * @return array<string, mixed>
 */
public function parseBusinessData(array $place): array
{
    // NOTE: Do NOT call fetchAndStorePhotos() here.
    // Photos are fetched on-demand when displayed, not during discovery.
    // Store photo references only if present (from Pro enrichment).
    $photoRefs = [];
    foreach (($place['photos'] ?? []) as $photo) {
        $photoRefs[] = $photo['name'] ?? null;
    }
    $photoRefs = array_filter($photoRefs);

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
        'images' => $photoRefs, // Store references only, not binary
        'serp_metadata' => $place,
        'serp_source' => 'google_places',
    ];
}
```

#### Change 4: Add `enrichBusinessDetails()` for deferred Pro enrichment

**Add this new method:**

```php
/**
 * Enrich a business with Pro-tier data from Place Details (New).
 * Cost: $20/1K (Pro SKU). Only call for businesses WITH websites.
 *
 * @param string $placeId The Google Place ID (e.g., "places/ChIJ...")
 * @return array<string, mixed>|null Pro-tier fields, or null on failure
 */
public function enrichBusinessDetails(string $placeId): ?array
{
    if (empty($this->apiKey)) {
        return null;
    }

    $fieldMask = implode(',', [
        'id',
        'regularOpeningHours',
        'editorialSummary',
        'rating',
        'userRatingCount',
        'priceLevel',
        'photos',
    ]);

    // Place Details uses GET with the place resource name
    $resourceName = str_starts_with($placeId, 'places/')
        ? $placeId
        : "places/{$placeId}";

    try {
        $response = Http::timeout(15)
            ->withHeaders([
                'X-Goog-Api-Key' => $this->apiKey,
                'X-Goog-FieldMask' => $fieldMask,
            ])
            ->get("https://places.googleapis.com/v1/{$resourceName}");

        if (! $response->successful()) {
            Log::warning('Place Details enrichment failed', [
                'place_id' => $placeId,
                'status' => $response->status(),
            ]);
            return null;
        }

        $data = $response->json();

        // Extract photo references (not binary)
        $photoRefs = [];
        foreach (($data['photos'] ?? []) as $photo) {
            $photoRefs[] = $photo['name'] ?? null;
        }

        return [
            'rating' => $data['rating'] ?? null,
            'reviews_count' => $data['userRatingCount'] ?? 0,
            'opening_hours' => $data['regularOpeningHours']['weekdayDescriptions'] ?? null,
            'description' => $data['editorialSummary']['text'] ?? null,
            'price_level' => $this->mapPriceLevel($data['priceLevel'] ?? null),
            'photo_references' => array_filter($photoRefs),
        ];
    } catch (Exception $e) {
        Log::error('Place Details enrichment error', [
            'place_id' => $placeId,
            'error' => $e->getMessage(),
        ]);
        return null;
    }
}

/**
 * Fetch a place photo by reference name.
 * Call this lazily when a photo is displayed, not during discovery.
 *
 * @param string $photoName The photo resource name from search results
 * @param int $maxWidth Maximum width in pixels
 * @return string|null The photo binary data, or null on failure
 */
public function fetchPhotoByReference(string $photoName, int $maxWidth = 800): ?string
{
    if (empty($this->apiKey)) {
        return null;
    }

    try {
        $response = Http::timeout(15)
            ->withHeaders(['X-Goog-Api-Key' => $this->apiKey])
            ->get(self::PHOTO_URL . "/{$photoName}/media", [
                'maxWidthPx' => $maxWidth,
                'skipHttpRedirect' => false,
            ]);

        if ($response->successful()) {
            return $response->body();
        }
    } catch (Exception $e) {
        Log::warning('Photo fetch failed', ['photo' => $photoName, 'error' => $e->getMessage()]);
    }

    return null;
}
```

---

## Implementation Steps

1. Replace `getDiscoveryFieldMask()` with Essentials-only (9 fields).
2. Update `searchNearbyPlaces()` to use `$this->getDiscoveryFieldMask()`.
3. Replace `parseBusinessData()` to remove `fetchAndStorePhotos()` call and handle missing fields.
4. Add `enrichBusinessDetails()` and `fetchPhotoByReference()` methods.
5. Verify no other code calls `fetchAndStorePhotos()` during discovery.

---

## Verification

```bash
# Check that the discovery mask has exactly 9 fields (no Pro/Enterprise)
php artisan tinker --execute="
    \$gps = app(\App\Services\News\GooglePlacesService::class);
    \$mask = (new \ReflectionMethod(\$gps, 'getDiscoveryFieldMask'))->invoke(\$gps);
    \$fields = explode(',', \$mask);
    echo 'Field count: ' . count(\$fields) . PHP_EOL;
    echo 'Has photos: ' . (str_contains(\$mask, 'photos') ? 'BAD' : 'GOOD') . PHP_EOL;
    echo 'Has editorialSummary: ' . (str_contains(\$mask, 'editorialSummary') ? 'BAD' : 'GOOD') . PHP_EOL;
    echo 'Has regularOpeningHours: ' . (str_contains(\$mask, 'regularOpeningHours') ? 'BAD' : 'GOOD') . PHP_EOL;
"

# Grep to ensure no fetchAndStorePhotos in discovery path
grep -rn "fetchAndStorePhotos" app/Services/News/GooglePlacesService.php
# Expected: only the method definition, NOT any calls from parseBusinessData
```

**Expected:** Field count: 9, all "GOOD", no `fetchAndStorePhotos` calls in `parseBusinessData`.

**Cost impact:** Every subsequent API call now costs $5/1K instead of $25/1K. 80% savings.
