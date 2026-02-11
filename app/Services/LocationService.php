<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Region;
use Exception;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Stevebauman\Location\Facades\Location;
use Stevebauman\Location\Position;

final class LocationService
{
    /**
     * Detect location from IP address
     */
    public function detectFromIp(?string $ip = null): ?Position
    {
        if ($ip === null) {
            $ip = request()->ip();
        }

        try {
            $location = Location::get($ip);

            // Location::get() can return false on failure
            return $location instanceof Position ? $location : null;
        } catch (Exception $e) {
            report($e);

            return null;
        }
    }

    /**
     * Find regions by zipcode
     */
    public function findRegionsByZipcode(string $zipcode): Collection
    {
        if (! Schema::hasTable('regions')) {
            return collect();
        }

        return Cache::remember(
            "regions:zipcode:{$zipcode}",
            now()->addHours(24),
            fn () => Region::active()
                ->forZipcode($zipcode)
                ->with('parent')
                ->orderBy('type', 'desc')
                ->get()
        );
    }

    /**
     * Find the most specific region for a zipcode (city over county over state)
     */
    public function findPrimaryRegionByZipcode(string $zipcode): ?Region
    {
        $regions = $this->findRegionsByZipcode($zipcode);

        if ($regions->isEmpty()) {
            return null;
        }

        $priorities = ['neighborhood', 'city', 'county', 'state'];

        foreach ($priorities as $type) {
            $region = $regions->firstWhere('type', $type);
            if ($region !== null) {
                return $region;
            }
        }

        return $regions->first();
    }

    /**
     * Find nearest region by coordinates using Haversine formula
     */
    public function findNearestRegion(float $latitude, float $longitude, ?string $type = null): ?Region
    {
        if (! Schema::hasTable('regions')) {
            return null;
        }

        $query = Region::active()
            ->whereNotNull('latitude')
            ->whereNotNull('longitude');

        if ($type !== null) {
            $query->ofType($type);
        }

        $regions = $query->get();

        if ($regions->isEmpty()) {
            return null;
        }

        $nearest = null;
        $minDistance = PHP_FLOAT_MAX;

        foreach ($regions as $region) {
            $distance = $this->calculateDistance(
                $latitude,
                $longitude,
                (float) $region->latitude,
                (float) $region->longitude
            );

            if ($distance < $minDistance) {
                $minDistance = $distance;
                $nearest = $region;
            }
        }

        return $nearest;
    }

    /**
     * Set user's location preference in session and cookie
     */
    public function setUserLocation(string $regionId): void
    {
        session()->put('user_location_region_id', $regionId);
        session()->put('user_location_confirmed', true);
        cookie()->queue('user_location_region_id', $regionId, 60 * 24 * 365);
    }

    /**
     * Get user's stored location from session or cookie
     */
    public function getUserLocation(): ?Region
    {
        if (! Schema::hasTable('regions')) {
            return null;
        }

        $regionId = session('user_location_region_id')
            ?? request()->cookie('user_location_region_id');

        if ($regionId === null) {
            return null;
        }

        return Region::find($regionId);
    }

    /**
     * Clear user's location preference
     */
    public function clearUserLocation(): void
    {
        session()->forget(['user_location_region_id', 'user_location_confirmed']);
        cookie()->queue(cookie()->forget('user_location_region_id'));
    }

    /**
     * Check if user has confirmed their location
     */
    public function hasUserConfirmedLocation(): bool
    {
        return (bool) session('user_location_confirmed', false);
    }

    /**
     * Search regions by name or zipcode
     */
    public function searchRegions(string $query, int $limit = 10): Collection
    {
        if (! Schema::hasTable('regions')) {
            return collect();
        }

        $operator = DB::connection()->getDriverName() === 'pgsql' ? 'ilike' : 'like';

        return Region::active()
            ->where(function ($q) use ($query, $operator) {
                $q->where('name', $operator, "%{$query}%")
                    ->orWhere('slug', $operator, "%{$query}%")
                    ->orWhereHas('zipcodes', function ($q) use ($query) {
                        $q->where('zipcode', 'like', "{$query}%");
                    });
            })
            ->with('parent')
            ->orderBy('type', 'desc')
            ->orderBy('name')
            ->limit($limit)
            ->get();
    }

    /**
     * Get fallback region (default region when no location detected)
     */
    public function getFallbackRegion(): ?Region
    {
        if (! Schema::hasTable('regions')) {
            return null;
        }

        return Cache::remember(
            'regions:fallback',
            now()->addDay(),
            function () {
                // Double-check table exists inside closure (in case it was dropped)
                if (! Schema::hasTable('regions')) {
                    return null;
                }

                try {
                    return Region::active()
                        ->topLevel()
                        ->orderBy('display_order')
                        ->first();
                } catch (Exception $e) {
                    // If query fails (e.g., table doesn't exist), return null
                    return null;
                }
            }
        );
    }

    /**
     * Detect and resolve user's region with full fallback chain
     */
    public function detectUserRegion(?string $ip = null): ?Region
    {
        $ip = $ip ?? request()->ip();

        $storedRegion = $this->getUserLocation();
        if ($storedRegion !== null) {
            return $storedRegion;
        }

        $position = $this->detectFromIp($ip);

        // Use coordinate-based detection (finds nearest region of any type)
        if ($position !== null && $position->latitude !== null && $position->longitude !== null) {
            $region = $this->findNearestRegion((float) $position->latitude, (float) $position->longitude);
            if ($region !== null) {
                return $region;
            }
        }

        return $this->getFallbackRegion();
    }

    /**
     * Calculate distance between two coordinates using Haversine formula (in kilometers)
     */
    private function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371;

        $latDelta = deg2rad($lat2 - $lat1);
        $lonDelta = deg2rad($lon2 - $lon1);

        $a = sin($latDelta / 2) * sin($latDelta / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($lonDelta / 2) * sin($lonDelta / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }
}
