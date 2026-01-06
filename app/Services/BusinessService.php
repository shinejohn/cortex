<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Business;
use App\Models\Region;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

final class BusinessService
{
    public function __construct(
        private readonly GeocodingService $geocodingService,
        private readonly CacheService $cacheService
    ) {}

    /**
     * Create a new business
     */
    public function create(array $data): Business
    {
        // Geocode address if provided
        if (isset($data['address']) && !isset($data['latitude'], $data['longitude'])) {
            $geocoded = $this->geocodingService->geocodeAddress(
                $data['address'],
                $data['city'] ?? null,
                $data['state'] ?? null,
                $data['postal_code'] ?? null,
                $data['country'] ?? null
            );

            if ($geocoded) {
                $data['latitude'] = $geocoded['latitude'];
                $data['longitude'] = $geocoded['longitude'];
                $data['google_place_id'] = $geocoded['place_id'] ?? null;
            }
        }

        $business = Business::create($data);

        // Attach regions if provided
        if (isset($data['regions']) && is_array($data['regions'])) {
            $business->regions()->sync($data['regions']);
        }

        // Clear cache
        $this->clearBusinessCache($business);

        return $business->fresh(['regions']);
    }

    /**
     * Update an existing business
     */
    public function update(Business $business, array $data): Business
    {
        // Geocode address if changed
        $addressChanged = isset($data['address']) || isset($data['city']) || isset($data['state']) || isset($data['postal_code']);
        
        if ($addressChanged && !isset($data['latitude'], $data['longitude'])) {
            $geocoded = $this->geocodingService->geocodeAddress(
                $data['address'] ?? $business->address,
                $data['city'] ?? $business->city,
                $data['state'] ?? $business->state,
                $data['postal_code'] ?? $business->postal_code,
                $data['country'] ?? $business->country
            );

            if ($geocoded) {
                $data['latitude'] = $geocoded['latitude'];
                $data['longitude'] = $geocoded['longitude'];
                $data['google_place_id'] = $geocoded['place_id'] ?? null;
            }
        }

        $business->update($data);

        // Update regions if provided
        if (isset($data['regions']) && is_array($data['regions'])) {
            $business->regions()->sync($data['regions']);
        }

        // Clear cache
        $this->clearBusinessCache($business);

        return $business->fresh(['regions']);
    }

    /**
     * Find a business by ID
     */
    public function find(string $id): ?Business
    {
        $cacheKey = "business:{$id}";
        
        return $this->cacheService->remember($cacheKey, 3600, function () use ($id) {
            return Business::with(['regions', 'workspace'])->find($id);
        });
    }

    /**
     * Find a business by slug
     */
    public function findBySlug(string $slug): ?Business
    {
        $cacheKey = "business:slug:{$slug}";
        
        return $this->cacheService->remember($cacheKey, CacheService::DURATION_LONG, function () use ($slug) {
            return Business::with(['regions', 'workspace'])->where('slug', $slug)->first();
        });
    }

    /**
     * Search businesses
     */
    public function search(
        string $query = null,
        array $filters = [],
        int $perPage = 20,
        int $page = 1
    ): LengthAwarePaginator {
        $cacheKey = 'business:search:'.md5(serialize([$query, $filters, $perPage, $page]));
        
        return $this->cacheService->remember($cacheKey, 300, function () use ($query, $filters, $perPage, $page) {
            $searchQuery = Business::query();

            // Search query
            if ($query) {
                $searchQuery->where(function ($q) use ($query) {
                    $q->where('name', 'like', "%{$query}%")
                      ->orWhere('description', 'like', "%{$query}%")
                      ->orWhere('address', 'like', "%{$query}%")
                      ->orWhere('city', 'like', "%{$query}%");
                });
            }

            // Filters
            if (isset($filters['region_id'])) {
                $searchQuery->whereHas('regions', function ($q) use ($filters) {
                    $q->where('regions.id', $filters['region_id']);
                });
            }

            if (isset($filters['category'])) {
                $searchQuery->byCategory($filters['category']);
            }

            if (isset($filters['status'])) {
                $searchQuery->where('status', $filters['status']);
            }

            if (isset($filters['is_verified'])) {
                $searchQuery->where('is_verified', $filters['is_verified']);
            }

            if (isset($filters['is_organization'])) {
                $searchQuery->where('is_organization', $filters['is_organization']);
            }

            if (isset($filters['organization_type'])) {
                $searchQuery->where('organization_type', $filters['organization_type']);
            }

            if (isset($filters['organization_level'])) {
                $searchQuery->where('organization_level', $filters['organization_level']);
            }

            // Location filter
            if (isset($filters['latitude'], $filters['longitude'], $filters['radius'])) {
                $searchQuery->withinRadius(
                    (float) $filters['latitude'],
                    (float) $filters['longitude'],
                    (float) $filters['radius']
                );
            }

            // Sorting
            $sortBy = $filters['sort_by'] ?? 'name';
            $sortOrder = $filters['sort_order'] ?? 'asc';
            
            if ($sortBy === 'rating') {
                $searchQuery->orderBy('rating', $sortOrder);
            } elseif ($sortBy === 'reviews_count') {
                $searchQuery->orderBy('reviews_count', $sortOrder);
            } elseif ($sortBy === 'distance' && isset($filters['latitude'], $filters['longitude'])) {
                $searchQuery->orderBy('distance', $sortOrder);
            } else {
                $searchQuery->orderBy($sortBy, $sortOrder);
            }

            return $searchQuery->with(['regions', 'workspace'])
                ->paginate($perPage, ['*'], 'page', $page);
        });
    }

    /**
     * Get businesses by region
     */
    public function getByRegion(Region|string $region, int $limit = 50): Collection
    {
        $regionId = $region instanceof Region ? $region->id : $region;
        $cacheKey = "businesses:region:{$regionId}:limit:{$limit}";
        
        return $this->cacheService->remember($cacheKey, 600, function () use ($regionId, $limit) {
            return Business::whereHas('regions', function ($q) use ($regionId) {
                $q->where('regions.id', $regionId);
            })
            ->active()
            ->with(['regions'])
            ->limit($limit)
            ->get();
        });
    }

    /**
     * Get businesses by category
     */
    public function getByCategory(string $category, int $limit = 50): Collection
    {
        $cacheKey = "businesses:category:{$category}:limit:{$limit}";
        
        return $this->cacheService->remember($cacheKey, 600, function () use ($category, $limit) {
            return Business::byCategory($category)
                ->active()
                ->with(['regions'])
                ->limit($limit)
                ->get();
        });
    }

    /**
     * Get featured businesses
     */
    public function getFeatured(int $limit = 10): Collection
    {
        $cacheKey = "businesses:featured:limit:{$limit}";
        
        return $this->cacheService->remember($cacheKey, 1800, function () use ($limit) {
            return Business::where('featured', true)
                ->active()
                ->verified()
                ->with(['regions'])
                ->orderBy('rating', 'desc')
                ->limit($limit)
                ->get();
        });
    }

    /**
     * Get businesses within radius
     */
    public function getWithinRadius(float $latitude, float $longitude, float $radiusKm, int $limit = 50): Collection
    {
        $cacheKey = "businesses:radius:{$latitude}:{$longitude}:{$radiusKm}:limit:{$limit}";
        
        return $this->cacheService->remember($cacheKey, 300, function () use ($latitude, $longitude, $radiusKm, $limit) {
            return Business::withinRadius($latitude, $longitude, $radiusKm)
                ->active()
                ->with(['regions'])
                ->orderBy('distance', 'asc')
                ->limit($limit)
                ->get();
        });
    }

    /**
     * Delete a business
     */
    public function delete(Business $business): bool
    {
        $id = $business->id;
        $result = $business->delete();
        
        // Clear cache
        $this->clearBusinessCache($business);
        
        return $result;
    }

    /**
     * Clear business-related cache
     */
    private function clearBusinessCache(Business $business): void
    {
        $this->cacheService->forget("business:{$business->id}");
        $this->cacheService->forget("business:slug:{$business->slug}");
        
        // Clear region caches
        foreach ($business->regions as $region) {
            $this->cacheService->forget("businesses:region:{$region->id}:limit:*");
        }
        
        // Clear category caches
        if ($business->categories) {
            foreach ($business->categories as $category) {
                $this->cacheService->forget("businesses:category:{$category}:limit:*");
            }
        }
        
        // Clear search caches (pattern matching would be ideal, but Cache doesn't support it)
        // In production, consider using Redis with pattern matching or cache tags
    }

    /**
     * Get business by slug or subdomain for AlphaSite page
     */
    public function getBusinessForAlphaSite(string $slugOrSubdomain): ?Business
    {
        $cacheKey = "alphasite:business:{$slugOrSubdomain}";
        
        return $this->cacheService->remember($cacheKey, 3600, function () use ($slugOrSubdomain) {
            return Business::with([
                'industry',
                'template',
                'subscription',
                'achievements' => fn($q) => $q->orderBy('display_order'),
                'reviews' => fn($q) => $q->latest()->limit(10),
                'faqs' => fn($q) => $q->where('is_active', true),
            ])
            ->where('slug', $slugOrSubdomain)
            ->orWhere('alphasite_subdomain', $slugOrSubdomain)
            ->first();
        });
    }

    /**
     * Get businesses by industry for directory
     */
    public function getByIndustry(
        string $industrySlug,
        ?string $city = null,
        ?string $state = null,
        int $perPage = 24
    ): LengthAwarePaginator {
        $query = Business::query()
            ->with(['industry', 'subscription'])
            ->whereHas('industry', fn($q) => $q->where('slug', $industrySlug))
            ->where('status', 'active');
        
        if ($city) {
            $query->where('city', $city);
        }
        
        if ($state) {
            $query->where('state', $state);
        }
        
        return $query
            ->orderByDesc('featured')
            ->orderByDesc('rating')
            ->paginate($perPage);
    }

    /**
     * Get related businesses (same industry, nearby)
     */
    public function getRelatedBusinesses(Business $business, int $limit = 6): Collection
    {
        return Business::query()
            ->with(['industry'])
            ->where('id', '!=', $business->id)
            ->where('industry_id', $business->industry_id)
            ->where('city', $business->city)
            ->where('status', 'active')
            ->orderByDesc('rating')
            ->limit($limit)
            ->get();
    }
}

