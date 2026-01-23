# News Workflow Update Report

## Overview

This document describes the updates made to the Multisite platform's news workflow, bringing it up to date with the latest improvements from `multisite-fibonacco`. The updates focus on news source collection, news items, and article creation components.

## Summary of Changes

### 1. Google Places API Integration

**New Service**: `app/Services/News/GooglePlacesService.php`

The platform now uses Google Places API for business discovery instead of relying solely on SERP API. This provides several advantages:

- **More Accurate Business Data**: Google Places API provides structured, verified business information directly from Google's database
- **Better Photo Management**: Automatic fetching and storage of business photos with CDN proxy support
- **Enhanced Address Parsing**: Structured address components (city, state, postal code) extracted automatically
- **Primary Type Classification**: Businesses are classified with their primary Google Places type
- **Price Level Information**: Price level indicators ($, $$, $$$, $$$$) for restaurants and venues

**Key Features**:
- `discoverBusinessesForCategory()`: Discovers businesses for a single category (used by parallelized jobs)
- `parseBusinessData()`: Parses Google Places API response into standardized format
- `fetchAndStorePhotos()`: Fetches and stores business photos with configurable limits
- Retry logic with exponential backoff for API reliability

### 2. Enhanced SerpApiService

**Updated**: `app/Services/News/SerpApiService.php`

- **Deprecation Notices**: Business discovery methods now marked as deprecated, pointing to `GooglePlacesService`
- **Regional Query Building**: New `buildRegionalQuery()` method for better news targeting
  - Includes state abbreviations for cities/neighborhoods to avoid confusion with same-named places
  - Handles county and state-level regions appropriately
  - Prevents returning news from wrong locations (e.g., Melbourne, FL vs Melbourne, Australia)
- **Improved Category News Queries**: Uses state disambiguation in category news searches

### 3. Updated BusinessDiscoveryService

**Updated**: `app/Services/News/BusinessDiscoveryService.php`

- **Dependency Change**: Switched from `SerpApiService` to `GooglePlacesService` for business discovery
- **Per-Category Processing**: Now processes businesses category-by-category instead of bulk processing
- **Enhanced Data Storage**: `upsertBusiness()` now handles additional fields:
  - `city`, `state`, `postal_code` (structured address components)
  - `primary_type` (Google Places primary type)
  - `price_level` (price indicator)
  - `images` (array of stored photo metadata)
  - `serp_source` (set to 'google_places')
  - `serp_last_synced_at` (sync timestamp)

### 4. Configuration Enhancements

**Updated**: `config/news-workflow.php`

#### Google Places Configuration
- New `google_places` section with:
  - Photo storage settings (enabled/disabled, disk, path)
  - Max photos per business (default: 3)
  - Photo max width (default: 800px)

#### Category Updates
- Removed: `brewery`, `winery`, `town_hall` (not standard Google Places types)
- Changed: `bookstore` → `book_store` (Google Places type)
- Updated category frequencies and news terms accordingly

#### News Collection
- Added `max_businesses_per_category` setting for random sampling to conserve API credits

#### Location Verification
- New `location_verification` configuration section
- Enhanced `relevance_scoring` prompt with location verification logic
- New `location_verification` prompt for geographic verification
- Updated `trust_analysis` prompt (removed AI-curated context, cleaner rationale requirements)

#### Unsplash Storage
- Updated to use `FILESYSTEM_DISK` fallback for better environment flexibility

## Architecture Changes

### Service Dependency Flow

**Before**:
```
BusinessDiscoveryService → SerpApiService → Google Local Results
```

**After**:
```
BusinessDiscoveryService → GooglePlacesService → Google Places API
SerpApiService → (deprecated for business discovery, still used for news fetching)
```

### Data Flow

1. **Business Discovery** (Phase 1):
   - `BusinessDiscoveryService` calls `GooglePlacesService.discoverBusinessesForCategory()` for each category
   - Google Places API returns structured business data
   - Photos are fetched and stored automatically
   - Businesses are upserted with enhanced metadata

2. **News Collection** (Phase 2):
   - Still uses `SerpApiService` for fetching news articles
   - Enhanced regional queries prevent location confusion
   - Category news queries include state disambiguation

## What the Updated Code Does

### Google Places API Integration

The `GooglePlacesService` provides a modern, structured approach to business discovery:

1. **Business Discovery**: Uses Google Places Nearby Search API to find businesses within a configurable radius
2. **Photo Management**: Automatically fetches up to 3 photos per business, stores them with organized paths (`business-photos/YYYY/MM/place-id-index.jpg`)
3. **CDN Proxy Support**: Generates `/img-cdn/` URLs for serving photos through the application's CDN proxy
4. **Address Parsing**: Extracts structured address components (city, state, postal code) from Google's address components
5. **Data Normalization**: Converts Google Places data into a consistent format matching the Business model

### Enhanced Regional Query Building

The `buildRegionalQuery()` method in `SerpApiService` improves news search accuracy:

- **City/Neighborhood Queries**: Includes state abbreviation (e.g., "Melbourne FL entertainment")
- **County Queries**: Includes state abbreviation (e.g., "Brevard County FL news")
- **State Queries**: Uses state name only (e.g., "Florida news")
- **Prevents Confusion**: Avoids returning news from same-named locations in other states/countries

### Location Verification

Enhanced prompts now include location verification:

- **Relevance Scoring**: Checks location match before scoring (rejects with 0-10 score if wrong location)
- **Location Verification Prompt**: Dedicated prompt for geographic verification
- **State/County Context**: Uses full geographic context (state name, abbreviation, county) for verification

## Compatibility Notes

- **Business Model**: Already supports all new fields (verified)
- **NewsCollectionService**: Compatible - still uses SerpApiService for news fetching
- **Backward Compatibility**: Deprecation notices maintain backward compatibility
- **Configuration**: Google Maps API key must be set in `services.google.maps_api_key`

## Dependencies Verified

✅ **Business Model Fields**:
- `google_place_id` ✓
- `city`, `state`, `postal_code` ✓
- `primary_type`, `price_level` ✓
- `images` (array) ✓
- `serp_source`, `serp_last_synced_at` ✓

✅ **Configuration**:
- `services.google.maps_api_key` exists in `config/services.php` ✓
- Google Places config section added ✓

## Next Steps

1. **Environment Configuration**: Ensure `GOOGLE_MAPS_API_KEY` is set in `.env`
2. **Testing**: Test business discovery with Google Places API
3. **Migration**: If needed, migrate existing businesses to use Google Places data
4. **Monitoring**: Monitor API usage and costs for Google Places API

## Files Modified

- ✅ `app/Services/News/GooglePlacesService.php` (NEW)
- ✅ `app/Services/News/SerpApiService.php` (UPDATED)
- ✅ `app/Services/News/BusinessDiscoveryService.php` (UPDATED)
- ✅ `config/news-workflow.php` (UPDATED)

## Files Verified

- ✅ `app/Services/News/NewsCollectionService.php` (COMPATIBLE)
- ✅ `app/Models/Business.php` (SUPPORTS ALL FIELDS)
- ✅ `config/services.php` (HAS GOOGLE MAPS API KEY CONFIG)

