<?php

declare(strict_types=1);

namespace App\Services\AlphaSite;

use App\Models\AlphasiteCategory;
use App\Models\Business;
use App\Models\BusinessServiceArea;
use App\Models\City;
use Illuminate\Database\Eloquent\Builder;

/**
 * Service for querying businesses that serve a given city,
 * including home-city businesses and service-area businesses.
 */
final class BusinessQueryService
{
    /**
     * Get a builder for businesses serving a given city.
     * Includes:
     * 1. Businesses with city_id = cityId (home city)
     * 2. Businesses with active city-level service area for this city
     * 3. Businesses with active county-level service area covering the city's county
     */
    public function businessesServingCity(string $cityId, ?string $categoryId = null): Builder
    {
        $city = City::find($cityId);

        $serviceAreaBusinessIds = BusinessServiceArea::query()
            ->where('status', 'active')
            ->where(function (Builder $q) use ($cityId, $city) {
                $q->where(function (Builder $inner) use ($cityId) {
                    $inner->where('area_type', BusinessServiceArea::AREA_TYPE_CITY)
                        ->where('city_id', $cityId);
                });

                if ($city && $city->county_id) {
                    $q->orWhere(function (Builder $inner) use ($city) {
                        $inner->where('area_type', BusinessServiceArea::AREA_TYPE_COUNTY)
                            ->where('county_id', $city->county_id);
                    });
                }
            })
            ->pluck('business_id');

        $query = Business::query()
            ->where(function (Builder $q) use ($cityId, $serviceAreaBusinessIds) {
                $q->where('city_id', $cityId)
                    ->orWhereIn('id', $serviceAreaBusinessIds);
            });

        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }

        return $query;
    }

    /**
     * Get businesses for a city+category page, ordered for display.
     * Home-city businesses appear first, then by rating DESC, then name.
     */
    public function businessesForCityCategory(string $cityId, string $categoryId): Builder
    {
        return $this->businessesServingCity($cityId, $categoryId)
            ->orderByRaw('CASE WHEN city_id = ? THEN 0 ELSE 1 END', [$cityId])
            ->orderByDesc('rating')
            ->orderBy('name');
    }

    /**
     * Count businesses serving a city, optionally filtered by category.
     */
    public function countBusinessesServingCity(string $cityId, ?string $categoryId = null): int
    {
        return $this->businessesServingCity($cityId, $categoryId)->count();
    }

    /**
     * Get all categories with business counts for a city (including service-area businesses).
     *
     * @return array<int, array{id: string, name: string, slug: string, icon: ?string, business_count: int}>
     */
    public function categoriesWithCountsForCity(string $cityId): array
    {
        $categories = AlphasiteCategory::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        $results = [];

        foreach ($categories as $category) {
            $count = $this->countBusinessesServingCity($cityId, $category->id);

            if ($count > 0) {
                $results[] = [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'icon' => $category->icon,
                    'business_count' => $count,
                ];
            }
        }

        return $results;
    }
}
