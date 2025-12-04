<?php

declare(strict_types=1);

namespace App\Contracts;

interface GeocodingServiceInterface
{
    /**
     * Geocode an address to coordinates
     *
     * @return array{latitude: float, longitude: float, postal_code: ?string, google_place_id: ?string}|null
     */
    public function geocodeAddress(string $address): ?array;

    /**
     * Geocode a venue by name and optional address
     *
     * @return array{latitude: float, longitude: float, postal_code: ?string, google_place_id: ?string}|null
     */
    public function geocodeVenue(string $venueName, ?string $address = null, ?string $regionName = null): ?array;

    /**
     * Clear cached geocoding results for an address
     */
    public function clearCache(string $address): bool;

    /**
     * Geocode a region and update its coordinates
     */
    public function geocodeRegion(\App\Models\Region $region): bool;
}
