# TASK-03-P2: Expand Google Places Category List to 87

## Context

The current `config/news-workflow.php` has ~31 hardcoded categories in `business_discovery.categories`. This misses entire verticals: education, lodging, automotive, shopping, professional services. Expanding to 87 categories ensures every business type in every community is discovered.

**Depends on:** Nothing (can run in parallel with TASK-01 and TASK-02).

### Existing Code: config/news-workflow.php (business_discovery section)

```php
'business_discovery' => [
    'enabled' => env('NEWS_WORKFLOW_BUSINESS_DISCOVERY', true),
    'categories' => [
        'restaurant', 'cafe', 'bar', 'bakery', /* ... ~31 total */
        'performing_arts_theater', 'concert_hall', 'movie_theater',
        'museum', 'art_gallery', 'library', /* etc */
    ],
    'radius_km' => env('NEWS_WORKFLOW_BUSINESS_RADIUS', 25),
],
```

---

## Objective

Replace the category list with 87 categories organized into three tiers: 16 dense (use Text Search with pagination), 59 sparse (use Nearby Search), and 12 text-search catch-alls. Add metadata about which search method to use per category.

---

## Files to Modify

### MODIFY: config/news-workflow.php

**Find the entire `'business_discovery'` section and replace it with:**

```php
'business_discovery' => [
    'enabled' => env('NEWS_WORKFLOW_BUSINESS_DISCOVERY', true),
    'radius_km' => env('NEWS_WORKFLOW_BUSINESS_RADIUS', 25),

    // Categories split by search strategy.
    // Dense = Text Search (New) with pagination (up to 60 results).
    // Sparse = Nearby Search (New) capped at 20 results.
    'dense_categories' => [
        'restaurant',
        'cafe',
        'bar',
        'bakery',
        'fast_food_restaurant',
        'doctor',
        'dentist',
        'lawyer',
        'church',
        'hair_salon',
        'beauty_salon',
        'grocery_store',
        'clothing_store',
        'hotel',
        'school',
        'real_estate_agency',
    ],

    'sparse_categories' => [
        // Healthcare
        'hospital', 'pharmacy', 'veterinary_care', 'chiropractor',
        // Financial & Professional
        'bank', 'insurance_agency', 'accounting',
        // Automotive
        'car_dealer', 'car_repair', 'gas_station', 'car_rental',
        'electric_vehicle_charging_station',
        // Retail & Shopping
        'supermarket', 'hardware_store', 'florist', 'shopping_mall',
        'convenience_store', 'department_store', 'home_improvement_store',
        'jewelry_store', 'liquor_store', 'shoe_store', 'sporting_goods_store',
        'pet_store', 'book_store', 'cell_phone_store', 'gift_shop',
        // Services
        'plumber', 'electrician', 'barber_shop', 'nail_salon',
        'laundry', 'moving_company', 'storage',
        // Funeral & Cemetery
        'funeral_home', 'cemetery',
        // Education
        'university', 'preschool',
        // Government & Public
        'city_hall', 'courthouse', 'local_government_office',
        'police', 'fire_station', 'post_office', 'library',
        // Community & Religious
        'community_center', 'mosque', 'synagogue', 'hindu_temple',
        // Entertainment & Recreation
        'museum', 'art_gallery', 'performing_arts_theater',
        'movie_theater', 'amusement_park', 'zoo', 'aquarium',
        'park', 'fitness_center', 'gym', 'spa', 'golf_course',
        'bowling_alley', 'campground',
        // Lodging
        'motel', 'bed_and_breakfast', 'resort_hotel',
        // Events
        'event_venue', 'convention_center', 'wedding_venue',
        'night_club', 'casino',
        // Tourism
        'tourist_attraction', 'visitor_center', 'marina',
    ],

    // Text-search catch-alls for business types not in Google's Table A.
    // These use free-text queries: "{query} in {city}, {state}"
    'text_search_queries' => [
        'accounting firms',
        'contractors and trades',
        'pest control',
        'roofing companies',
        'landscaping services',
        'cleaning services',
        'tutoring centers',
        'daycare centers',
        'senior living facilities',
        'coworking spaces',
        'printing services',
        'catering companies',
    ],

    // Legacy combined list for backward compatibility.
    // Services that call config('news-workflow.business_discovery.categories')
    // should be updated to use dense_categories + sparse_categories instead.
    'categories' => array_merge(
        // This will be populated at runtime from dense + sparse
    ),
],
```

**IMPORTANT:** Since PHP config files can't use `array_merge()` with keys defined in the same array, replace the `'categories'` key with a static combined list. The full combined list:

```php
'categories' => [
    // Dense (16)
    'restaurant', 'cafe', 'bar', 'bakery', 'fast_food_restaurant',
    'doctor', 'dentist', 'lawyer', 'church', 'hair_salon',
    'beauty_salon', 'grocery_store', 'clothing_store', 'hotel',
    'school', 'real_estate_agency',
    // Sparse (59)
    'hospital', 'pharmacy', 'veterinary_care', 'chiropractor',
    'bank', 'insurance_agency', 'accounting',
    'car_dealer', 'car_repair', 'gas_station', 'car_rental',
    'electric_vehicle_charging_station',
    'supermarket', 'hardware_store', 'florist', 'shopping_mall',
    'convenience_store', 'department_store', 'home_improvement_store',
    'jewelry_store', 'liquor_store', 'shoe_store', 'sporting_goods_store',
    'pet_store', 'book_store', 'cell_phone_store', 'gift_shop',
    'plumber', 'electrician', 'barber_shop', 'nail_salon',
    'laundry', 'moving_company', 'storage',
    'funeral_home', 'cemetery',
    'university', 'preschool',
    'city_hall', 'courthouse', 'local_government_office',
    'police', 'fire_station', 'post_office', 'library',
    'community_center', 'mosque', 'synagogue', 'hindu_temple',
    'museum', 'art_gallery', 'performing_arts_theater',
    'movie_theater', 'amusement_park', 'zoo', 'aquarium',
    'park', 'fitness_center', 'gym', 'spa', 'golf_course',
    'bowling_alley', 'campground',
    'motel', 'bed_and_breakfast', 'resort_hotel',
    'event_venue', 'convention_center', 'wedding_venue',
    'night_club', 'casino',
    'tourist_attraction', 'visitor_center', 'marina',
],
```

Also update `category_news_terms` to include new mappings for the added categories:

```php
// ADD these to the existing 'category_news_terms' array:
'fast_food_restaurant' => 'restaurants',
'hospital' => 'hospital',
'pharmacy' => 'pharmacy',
'veterinary_care' => 'veterinary',
'chiropractor' => 'health',
'bank' => 'banking',
'insurance_agency' => 'insurance',
'accounting' => 'business',
'car_dealer' => 'automotive',
'car_repair' => 'automotive',
'gas_station' => 'local business',
'supermarket' => 'grocery',
'hardware_store' => 'home improvement',
'florist' => 'local business',
'funeral_home' => 'obituaries',
'cemetery' => 'community',
'university' => 'university',
'preschool' => 'education',
'post_office' => 'postal',
'mosque' => 'faith community',
'synagogue' => 'faith community',
'hindu_temple' => 'faith community',
'fitness_center' => 'fitness',
'golf_course' => 'golf',
'event_venue' => 'events',
'wedding_venue' => 'weddings',
'motel' => 'lodging',
'bed_and_breakfast' => 'lodging',
'resort_hotel' => 'tourism',
'marina' => 'boating',
'visitor_center' => 'tourism',
```

Also update `fetch_frequencies.news_categories` with appropriate frequencies for new categories.

---

## Implementation Steps

1. Open `config/news-workflow.php`.
2. Replace the `business_discovery` section with the expanded version above.
3. Add new entries to `category_news_terms`.
4. Add new entries to `fetch_frequencies.news_categories`.
5. Clear config cache.

---

## Verification

```bash
php artisan config:clear

php artisan tinker --execute="
    \$dense = config('news-workflow.business_discovery.dense_categories');
    \$sparse = config('news-workflow.business_discovery.sparse_categories');
    \$all = config('news-workflow.business_discovery.categories');
    echo 'Dense: ' . count(\$dense) . PHP_EOL;
    echo 'Sparse: ' . count(\$sparse) . PHP_EOL;
    echo 'Combined: ' . count(\$all) . PHP_EOL;
    echo 'Text queries: ' . count(config('news-workflow.business_discovery.text_search_queries')) . PHP_EOL;
"
```

**Expected:** Dense: 16, Sparse: 59, Combined: 75+, Text queries: 12
